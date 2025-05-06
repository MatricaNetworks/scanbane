import axios from 'axios';
import { aiService } from './ai-service';
import { virusTotalService } from './virus-total-service';
import { log } from '../vite';
import * as cheerio from 'cheerio';
import whois from 'whois';
import { promisify } from 'util';

// Promisify whois lookup
const whoisLookup = promisify(whois.lookup);

/**
 * Service for comprehensive URL analysis
 */
export class UrlAnalysisService {
  /**
   * Performs a comprehensive analysis of a URL using multiple services
   * @param url The URL to analyze
   */
  async analyzeUrl(url: string): Promise<{
    isMalicious: boolean;
    confidence: number;
    threatType: string | null;
    scanResults: {
      virusTotal?: any;
      ai?: any;
      googleSafeBrowsing?: any;
      ipQualityScore?: any;
      domainInfo?: any;
      contentAnalysis?: any;
    };
    finalVerdict: string;
  }> {
    try {
      log(`Starting comprehensive URL analysis: ${url}`, 'url-analysis-service');
      
      // Normalize the URL
      const normalizedUrl = this.normalizeUrl(url);
      
      // Run parallel scans
      const [
        virusTotalResult,
        htmlContent,
        safeBrowsingResult,
        ipQualityScoreResult,
        domainInfo
      ] = await Promise.allSettled([
        virusTotalService.scanUrl(normalizedUrl),
        this.fetchUrlContent(normalizedUrl),
        this.checkGoogleSafeBrowsing(normalizedUrl),
        this.checkIpQualityScore(normalizedUrl),
        this.getDomainInfo(normalizedUrl)
      ]);
      
      // AI analysis with HTML content if available
      const html = htmlContent.status === 'fulfilled' ? htmlContent.value : undefined;
      const aiResult = await aiService.analyzeUrl(normalizedUrl, html);
      
      // Content analysis if HTML is available
      const contentAnalysis = html ? this.analyzeHtmlContent(html) : undefined;
      
      // Compile all results
      const scanResults: any = {
        virusTotal: virusTotalResult.status === 'fulfilled' ? virusTotalResult.value : null,
        ai: aiResult,
        googleSafeBrowsing: safeBrowsingResult.status === 'fulfilled' ? safeBrowsingResult.value : null,
        ipQualityScore: ipQualityScoreResult.status === 'fulfilled' ? ipQualityScoreResult.value : null,
        domainInfo: domainInfo.status === 'fulfilled' ? domainInfo.value : null,
        contentAnalysis
      };
      
      // Calculate final verdict
      const isMalicious = this.determineIfMalicious(scanResults);
      const confidence = this.calculateConfidence(scanResults);
      const threatType = this.determineThreatType(scanResults);
      const finalVerdict = this.generateVerdict(scanResults, isMalicious, confidence, threatType);
      
      return {
        isMalicious,
        confidence,
        threatType,
        scanResults,
        finalVerdict
      };
    } catch (error) {
      log(`Error in comprehensive URL analysis: ${error}`, 'url-analysis-service');
      return {
        isMalicious: false,
        confidence: 0,
        threatType: null,
        scanResults: {},
        finalVerdict: 'Analysis failed due to an error'
      };
    }
  }
  
  /**
   * Normalizes a URL for consistent analysis
   */
  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }
  
  /**
   * Fetches the HTML content of a URL
   */
  private async fetchUrlContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      log(`Error fetching URL content: ${error}`, 'url-analysis-service');
      return '';
    }
  }
  
  /**
   * Checks a URL against Google Safe Browsing API
   */
  private async checkGoogleSafeBrowsing(url: string): Promise<any> {
    try {
      const apiKey = process.env.GOOGLE_SAFEBROWSING_API_KEY;
      if (!apiKey) {
        return { error: 'Google Safe Browsing API key not configured' };
      }
      
      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          client: {
            clientId: 'scambane',
            clientVersion: '1.0.0'
          },
          threatInfo: {
            threatTypes: [
              'MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }]
          }
        }
      );
      
      const matches = response.data.matches || [];
      return {
        isMalicious: matches.length > 0,
        matches,
        platformTypes: matches.map((m: any) => m.platformType),
        threatTypes: matches.map((m: any) => m.threatType)
      };
    } catch (error) {
      log(`Error checking Google Safe Browsing: ${error}`, 'url-analysis-service');
      return { error: 'Google Safe Browsing check failed' };
    }
  }
  
  /**
   * Checks a URL against IP Quality Score API
   */
  private async checkIpQualityScore(url: string): Promise<any> {
    try {
      const apiKey = process.env.IPQUALITYSCORE_API_KEY;
      if (!apiKey) {
        return { error: 'IP Quality Score API key not configured' };
      }
      
      const response = await axios.get(
        `https://www.ipqualityscore.com/api/json/url/${apiKey}/${encodeURIComponent(url)}`
      );
      
      return {
        isMalicious: response.data.unsafe || response.data.malware || response.data.phishing || response.data.suspicious,
        riskScore: response.data.risk_score,
        malware: response.data.malware,
        phishing: response.data.phishing,
        suspicious: response.data.suspicious,
        adult: response.data.adult,
        category: response.data.category,
        domain_rank: response.data.domain_rank
      };
    } catch (error) {
      log(`Error checking IP Quality Score: ${error}`, 'url-analysis-service');
      return { error: 'IP Quality Score check failed' };
    }
  }
  
  /**
   * Gets WHOIS and domain information for a URL
   */
  private async getDomainInfo(url: string): Promise<any> {
    try {
      // Extract domain from URL
      const domain = new URL(url).hostname;
      
      // WHOIS lookup
      const whoisData = await whoisLookup(domain);
      
      // Extract creation date from WHOIS data (simplified)
      const creationDateMatch = whoisData.match(/Creation Date: (.+)/i) || 
                              whoisData.match(/created: (.+)/i) ||
                              whoisData.match(/Registered on: (.+)/i);
      
      const creationDate = creationDateMatch ? creationDateMatch[1].trim() : null;
      
      // Calculate domain age in days if creation date is available
      let domainAgeInDays = null;
      if (creationDate) {
        const createDate = new Date(creationDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createDate.getTime());
        domainAgeInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      // Check if domain contains suspicious TLDs
      const suspiciousTlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.club'];
      const hasSuspiciousTld = suspiciousTlds.some(tld => domain.endsWith(tld));
      
      return {
        domain,
        creationDate,
        domainAgeInDays,
        hasSuspiciousTld,
        isSuspicious: (domainAgeInDays !== null && domainAgeInDays < 30) || hasSuspiciousTld,
        rawWhois: whoisData
      };
    } catch (error) {
      log(`Error getting domain info: ${error}`, 'url-analysis-service');
      return { error: 'Domain info lookup failed' };
    }
  }
  
  /**
   * Analyzes HTML content for suspicious elements
   */
  private analyzeHtmlContent(html: string): any {
    try {
      const $ = cheerio.load(html);
      
      // Check for password fields (potential phishing indicator)
      const hasPasswordField = $('input[type="password"]').length > 0;
      
      // Check for login forms (potential phishing indicator)
      const hasLoginForm = $('form').filter(function() {
        return $(this).find('input[type="text"], input[type="email"], input[type="password"]').length > 0;
      }).length > 0;
      
      // Check for excessive external scripts or iframes (potential malware)
      const externalScripts = $('script[src]').filter(function() {
        const src = $(this).attr('src') || '';
        return src.startsWith('http') && !src.includes(window.location.hostname);
      }).length;
      
      const iframes = $('iframe').length;
      
      // Check for obfuscated JavaScript
      const scripts = $('script').map(function() {
        return $(this).html();
      }).get().join(' ');
      
      const hasObfuscatedJS = 
        scripts.includes('eval(') || 
        scripts.includes('document.write(') ||
        scripts.includes('fromCharCode') ||
        scripts.includes('unescape(');
      
      // Check for hidden elements (potential phishing)
      const hiddenElements = $('[style*="display:none"], [style*="display: none"], [style*="visibility:hidden"], [style*="visibility: hidden"]').length;
      
      // Title and meta info
      const title = $('title').text();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      return {
        hasPasswordField,
        hasLoginForm,
        externalScripts,
        iframes,
        hasObfuscatedJS,
        hiddenElements,
        title,
        metaDescription,
        isSuspicious: hasPasswordField || hasObfuscatedJS || (externalScripts > 5) || (hiddenElements > 3)
      };
    } catch (error) {
      log(`Error analyzing HTML content: ${error}`, 'url-analysis-service');
      return { error: 'HTML content analysis failed' };
    }
  }
  
  /**
   * Determines if a URL is malicious based on all scan results
   */
  private determineIfMalicious(scanResults: any): boolean {
    const results = [
      scanResults.virusTotal?.isMalicious,
      scanResults.ai?.isMalicious,
      scanResults.googleSafeBrowsing?.isMalicious,
      scanResults.ipQualityScore?.isMalicious,
      scanResults.domainInfo?.isSuspicious && (scanResults.contentAnalysis?.isSuspicious || scanResults.ai?.confidence > 0.7)
    ];
    
    // Count true values (excluding undefined/null)
    const trueCount = results.filter(r => r === true).length;
    const totalValid = results.filter(r => r !== undefined && r !== null).length;
    
    // If more than 50% of valid results indicate malicious
    return totalValid > 0 && (trueCount / totalValid) > 0.5;
  }
  
  /**
   * Calculates the confidence level of the verdict
   */
  private calculateConfidence(scanResults: any): number {
    let confidence = 0;
    let factorCount = 0;
    
    // VirusTotal
    if (scanResults.virusTotal) {
      confidence += scanResults.virusTotal.isMalicious ? 0.8 : 0.2;
      factorCount++;
    }
    
    // AI
    if (scanResults.ai) {
      confidence += scanResults.ai.confidence || 0.5;
      factorCount++;
    }
    
    // Google Safe Browsing
    if (scanResults.googleSafeBrowsing) {
      confidence += scanResults.googleSafeBrowsing.isMalicious ? 0.9 : 0.1;
      factorCount++;
    }
    
    // IP Quality Score
    if (scanResults.ipQualityScore) {
      if (scanResults.ipQualityScore.riskScore !== undefined) {
        confidence += scanResults.ipQualityScore.riskScore / 100;
      } else {
        confidence += scanResults.ipQualityScore.isMalicious ? 0.7 : 0.3;
      }
      factorCount++;
    }
    
    // Domain Info
    if (scanResults.domainInfo && !scanResults.domainInfo.error) {
      confidence += scanResults.domainInfo.isSuspicious ? 0.6 : 0.3;
      factorCount++;
    }
    
    // Content Analysis
    if (scanResults.contentAnalysis && !scanResults.contentAnalysis.error) {
      confidence += scanResults.contentAnalysis.isSuspicious ? 0.7 : 0.2;
      factorCount++;
    }
    
    // Calculate average confidence
    return factorCount > 0 ? confidence / factorCount : 0.5;
  }
  
  /**
   * Determines the threat type based on all scan results
   */
  private determineThreatType(scanResults: any): string | null {
    // Prioritize Google Safe Browsing and VirusTotal threat types
    if (scanResults.googleSafeBrowsing?.threatTypes?.length > 0) {
      return scanResults.googleSafeBrowsing.threatTypes[0];
    }
    
    if (scanResults.virusTotal?.threatCategories?.length > 0) {
      return scanResults.virusTotal.threatCategories[0];
    }
    
    // Check IP Quality Score
    if (scanResults.ipQualityScore) {
      if (scanResults.ipQualityScore.phishing) return 'phishing';
      if (scanResults.ipQualityScore.malware) return 'malware';
      if (scanResults.ipQualityScore.suspicious) return 'suspicious';
    }
    
    // Check content analysis for phishing indicators
    if (scanResults.contentAnalysis?.hasPasswordField && scanResults.contentAnalysis?.hasLoginForm) {
      return 'phishing';
    }
    
    // Check AI result
    if (scanResults.ai?.threatType) {
      return scanResults.ai.threatType;
    }
    
    // If the URL is malicious but no specific threat type, label as suspicious
    if (this.determineIfMalicious(scanResults)) {
      return 'suspicious';
    }
    
    return null;
  }
  
  /**
   * Generates a human-readable verdict based on scan results
   */
  private generateVerdict(scanResults: any, isMalicious: boolean, confidence: number, threatType: string | null): string {
    if (isMalicious) {
      const confidenceText = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'moderate' : 'low';
      const threatText = threatType ? threatType.toLowerCase() : 'suspicious content';
      
      return `This URL has been identified as potentially malicious with ${confidenceText} confidence. ` +
            `It may contain ${threatText}. We recommend not visiting this website.`;
    } else {
      return 'This URL appears to be safe based on our analysis. However, always exercise caution when visiting unfamiliar websites.';
    }
  }
}

// Export an instance for use across the application
export const urlAnalysisService = new UrlAnalysisService();