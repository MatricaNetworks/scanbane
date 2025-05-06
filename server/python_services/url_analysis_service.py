#!/usr/bin/env python3
"""
URL Analysis Service for ScamBane
Implements VirusTotal, Google SafeBrowsing, URLhaus, Maltiverse, and AbuseIPDB integrations
"""

import os
import sys
import json
import logging
import requests
import re
import urllib.parse
import tempfile
import hashlib
import time
from typing import Dict, List, Any, Tuple, Optional
from urllib.parse import urlparse
import socket
from bs4 import BeautifulSoup
import ssl

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class URLAnalyzer:
    """Comprehensive URL analysis using multiple security APIs"""
    
    def __init__(self):
        """Initialize API keys and settings"""
        # API keys from environment variables
        self.virustotal_api_key = os.environ.get('VIRUSTOTAL_API_KEY')
        self.safebrowsing_api_key = os.environ.get('GOOGLE_SAFEBROWSING_API_KEY')
        self.urlhaus_api_key = os.environ.get('URLHAUS_API_KEY')
        self.maltiverse_api_key = os.environ.get('MALTIVERSE_API_KEY')
        self.abuseipdb_api_key = os.environ.get('ABUSEIPDB_API_KEY')
        self.ipqualityscore_api_key = os.environ.get('IPQUALITYSCORE_API_KEY')
        
        # API endpoints
        self.virustotal_url = "https://www.virustotal.com/api/v3"
        self.safebrowsing_url = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
        self.urlhaus_url = "https://urlhaus-api.abuse.ch/v1"
        self.maltiverse_url = "https://api.maltiverse.com/url"
        self.abuseipdb_url = "https://api.abuseipdb.com/api/v2/check"
        self.ipqualityscore_url = "https://www.ipqualityscore.com/api/json/url"
    
    def analyze_url(self, url: str) -> Dict[str, Any]:
        """
        Perform comprehensive URL analysis using multiple services
        
        Args:
            url: The URL to analyze
            
        Returns:
            dict: Analysis results from all available services
        """
        try:
            # Normalize URL
            normalized_url = self._normalize_url(url)
            
            # Initialize overall results
            results = {
                "isMalicious": False,
                "confidence": 0.0,
                "threatType": None,
                "detectionMethods": [],
                "detectionsByService": {},
                "urlComponents": self._parse_url_components(normalized_url),
                "metadata": {
                    "originalUrl": url,
                    "normalizedUrl": normalized_url
                }
            }
            
            # Initialize execution time tracking
            start_time = time.time()
            
            # Run site content analysis
            try:
                content_analysis = self._analyze_site_content(normalized_url)
                results["contentAnalysis"] = content_analysis
                
                # Check if content analysis indicates phishing
                if content_analysis.get("hasLoginForm") and content_analysis.get("hasPasswordField"):
                    results["contentAnalysis"]["phishingIndicators"] = True
                
                # Update domain info if available
                if "domainInfo" in content_analysis:
                    results["metadata"]["domainInfo"] = content_analysis["domainInfo"]
                
            except Exception as e:
                logger.error(f"Content analysis error: {str(e)}")
                results["contentAnalysis"] = {"error": str(e)}
            
            # Run services in parallel (for production, implement proper async)
            # 1. Check VirusTotal
            if self.virustotal_api_key:
                try:
                    vt_result = self._check_virustotal(normalized_url)
                    results["detectionsByService"]["virusTotal"] = vt_result
                    
                    if vt_result.get("isMalicious"):
                        results["isMalicious"] = True
                        results["detectionMethods"].append("virusTotal")
                        
                        # If threat type not set and VT has categories, use first category
                        if not results["threatType"] and vt_result.get("threatCategories"):
                            results["threatType"] = vt_result["threatCategories"][0]
                except Exception as e:
                    logger.error(f"VirusTotal check error: {str(e)}")
                    results["detectionsByService"]["virusTotal"] = {"error": str(e)}
            
            # 2. Check Google Safe Browsing
            if self.safebrowsing_api_key:
                try:
                    sb_result = self._check_google_safebrowsing(normalized_url)
                    results["detectionsByService"]["googleSafeBrowsing"] = sb_result
                    
                    if sb_result.get("isMalicious"):
                        results["isMalicious"] = True
                        results["detectionMethods"].append("googleSafeBrowsing")
                        
                        # If threat type not set and Safe Browsing has threat types, use first type
                        if not results["threatType"] and sb_result.get("threatTypes"):
                            results["threatType"] = sb_result["threatTypes"][0]
                except Exception as e:
                    logger.error(f"Google SafeBrowsing check error: {str(e)}")
                    results["detectionsByService"]["googleSafeBrowsing"] = {"error": str(e)}
            
            # 3. Check URLhaus
            if self.urlhaus_api_key:
                try:
                    urlhaus_result = self._check_urlhaus(normalized_url)
                    results["detectionsByService"]["urlHaus"] = urlhaus_result
                    
                    if urlhaus_result.get("isMalicious"):
                        results["isMalicious"] = True
                        results["detectionMethods"].append("urlHaus")
                        
                        # If threat type not set and URLhaus has threat types, use it
                        if not results["threatType"] and urlhaus_result.get("threatType"):
                            results["threatType"] = urlhaus_result["threatType"]
                except Exception as e:
                    logger.error(f"URLhaus check error: {str(e)}")
                    results["detectionsByService"]["urlHaus"] = {"error": str(e)}
            
            # 4. Check Maltiverse
            if self.maltiverse_api_key:
                try:
                    maltiverse_result = self._check_maltiverse(normalized_url)
                    results["detectionsByService"]["maltiverse"] = maltiverse_result
                    
                    if maltiverse_result.get("isMalicious"):
                        results["isMalicious"] = True
                        results["detectionMethods"].append("maltiverse")
                        
                        # If threat type not set and Maltiverse has a classification, use it
                        if not results["threatType"] and maltiverse_result.get("classification"):
                            results["threatType"] = maltiverse_result["classification"]
                except Exception as e:
                    logger.error(f"Maltiverse check error: {str(e)}")
                    results["detectionsByService"]["maltiverse"] = {"error": str(e)}
            
            # 5. Check AbuseIPDB (for the domain's IP)
            if self.abuseipdb_api_key and results["urlComponents"].get("hostname"):
                try:
                    # Get IP address
                    hostname = results["urlComponents"]["hostname"]
                    try:
                        ip_address = socket.gethostbyname(hostname)
                        
                        # Only check if we got a valid IP
                        if ip_address and self._is_valid_ip(ip_address):
                            abuseipdb_result = self._check_abuseipdb(ip_address)
                            results["detectionsByService"]["abuseIPDB"] = abuseipdb_result
                            
                            if abuseipdb_result.get("isMalicious"):
                                # Don't mark URL as malicious just because the IP is suspicious
                                # but note it as a risk factor
                                results["detectionsByService"]["abuseIPDB"]["isRiskFactor"] = True
                                
                                # Only add to detection methods if confidence is high
                                if abuseipdb_result.get("abuseScore", 0) > 80:
                                    results["detectionMethods"].append("abuseIPDB")
                    except socket.gaierror:
                        logger.info(f"Could not resolve hostname: {hostname}")
                except Exception as e:
                    logger.error(f"AbuseIPDB check error: {str(e)}")
                    results["detectionsByService"]["abuseIPDB"] = {"error": str(e)}
            
            # 6. Check IP Quality Score
            if self.ipqualityscore_api_key:
                try:
                    ipqs_result = self._check_ipqualityscore(normalized_url)
                    results["detectionsByService"]["ipQualityScore"] = ipqs_result
                    
                    if ipqs_result.get("isMalicious"):
                        results["isMalicious"] = True
                        results["detectionMethods"].append("ipQualityScore")
                        
                        # If threat type not set and IPQS indicates a specific threat, use it
                        if not results["threatType"]:
                            if ipqs_result.get("phishing"):
                                results["threatType"] = "phishing"
                            elif ipqs_result.get("malware"):
                                results["threatType"] = "malware"
                except Exception as e:
                    logger.error(f"IP Quality Score check error: {str(e)}")
                    results["detectionsByService"]["ipQualityScore"] = {"error": str(e)}
            
            # Calculate overall confidence (weighted average of all methods)
            self._calculate_overall_confidence(results)
            
            # If the URL is marked as malicious but no threat type is set, set a default
            if results["isMalicious"] and not results["threatType"]:
                # Check if phishing indicators exist
                if results.get("contentAnalysis", {}).get("phishingIndicators"):
                    results["threatType"] = "phishing"
                else:
                    results["threatType"] = "suspicious"
            
            # Calculate execution time
            execution_time = time.time() - start_time
            results["metadata"]["executionTimeSeconds"] = round(execution_time, 2)
            
            return results
            
        except Exception as e:
            logger.error(f"URL analysis error: {str(e)}")
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "error": str(e),
                "detectionMethods": [],
                "originalUrl": url
            }
    
    def _normalize_url(self, url: str) -> str:
        """Normalize a URL to standard format"""
        # Add scheme if missing
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        
        # Parse and reconstruct to normalize
        parsed = urlparse(url)
        
        # Remove default ports
        netloc = parsed.netloc
        if ':' in netloc:
            hostname, port = netloc.split(':')
            if (parsed.scheme == 'http' and port == '80') or (parsed.scheme == 'https' and port == '443'):
                netloc = hostname
        
        # Remove trailing slash from path if it's just a slash
        path = parsed.path
        if path == '/':
            path = ''
        
        # Reconstruct
        normalized = urllib.parse.urlunparse((
            parsed.scheme,
            netloc,
            path,
            parsed.params,
            parsed.query,
            ''  # Remove fragment
        ))
        
        return normalized
    
    def _parse_url_components(self, url: str) -> Dict[str, Any]:
        """Parse a URL into its components for analysis"""
        parsed = urlparse(url)
        
        # Check if domain is an IP address
        is_ip = self._is_valid_ip(parsed.netloc.split(':')[0])
        
        # Extract domain and TLD
        hostname = parsed.netloc.split(':')[0]
        domain_parts = hostname.split('.')
        
        # Handle IP addresses
        if is_ip:
            return {
                "scheme": parsed.scheme,
                "hostname": hostname,
                "is_ip": True,
                "port": parsed.port or (443 if parsed.scheme == 'https' else 80),
                "path": parsed.path,
                "query": parsed.query,
                "fragment": parsed.fragment
            }
        
        # Handle domains (try to identify TLD and domain)
        tld = domain_parts[-1] if len(domain_parts) > 1 else ""
        domain = '.'.join(domain_parts[-2:]) if len(domain_parts) > 1 else hostname
        subdomain = '.'.join(domain_parts[:-2]) if len(domain_parts) > 2 else ""
        
        return {
            "scheme": parsed.scheme,
            "hostname": hostname,
            "is_ip": False,
            "domain": domain,
            "tld": tld,
            "subdomain": subdomain or None,
            "port": parsed.port or (443 if parsed.scheme == 'https' else 80),
            "path": parsed.path,
            "query": parsed.query,
            "fragment": parsed.fragment
        }
    
    def _is_valid_ip(self, ip: str) -> bool:
        """Check if a string is a valid IPv4 address"""
        try:
            socket.inet_aton(ip)
            return True
        except socket.error:
            return False
    
    def _analyze_site_content(self, url: str) -> Dict[str, Any]:
        """
        Analyze the content of a website for phishing indicators
        
        Args:
            url: URL to analyze
            
        Returns:
            dict: Analysis results
        """
        try:
            # Set a timeout for requests
            timeout = 10
            
            # Configure session with timeout and headers
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            })
            
            # Fetch domain info while content is being fetched
            domain_info = self._get_domain_info(url)
            
            # Make the request
            response = session.get(url, timeout=timeout, verify=False)
            response.raise_for_status()
            
            # Get content type
            content_type = response.headers.get('Content-Type', '').lower()
            
            # Only analyze HTML content
            if 'text/html' not in content_type:
                return {
                    "contentType": content_type,
                    "isHtml": False,
                    "domainInfo": domain_info
                }
            
            # Parse HTML
            html_content = response.text
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Initialize analysis results
            results = {
                "contentType": content_type,
                "isHtml": True,
                "title": soup.title.string if soup.title else None,
                "hasLoginForm": False,
                "hasPasswordField": False,
                "hasPhishingKeywords": False,
                "hasSuspiciousScripts": False,
                "externalResources": [],
                "phishingIndicators": False,
                "domainInfo": domain_info
            }
            
            # Check for login forms
            forms = soup.find_all('form')
            results["formCount"] = len(forms)
            
            for form in forms:
                inputs = form.find_all('input')
                
                # Check for password fields
                password_fields = [inp for inp in inputs if inp.get('type') == 'password']
                if password_fields:
                    results["hasPasswordField"] = True
                
                # Check for combinations that suggest login forms
                username_fields = [inp for inp in inputs if inp.get('type') in ['text', 'email'] or 
                                  any(attr in inp.get('name', '').lower() for attr in ['user', 'email', 'login'])]
                
                if password_fields and username_fields:
                    results["hasLoginForm"] = True
                    break
            
            # Check for phishing keywords in text
            phishing_keywords = [
                'verify', 'account', 'suspended', 'unusual activity', 'security', 'update', 
                'confirm', 'login', 'sign in', 'validate', 'unauthorized', 'expire'
            ]
            
            text = soup.get_text().lower()
            found_keywords = [kw for kw in phishing_keywords if kw in text]
            
            results["hasPhishingKeywords"] = len(found_keywords) > 2  # Require at least 3 matches
            results["phishingKeywordsFound"] = found_keywords
            
            # Check scripts for suspicious patterns
            scripts = soup.find_all('script')
            suspicious_script_patterns = [
                'password', 'login', 'user', 'email', 'document.cookie', 'localStorage', 
                'sessionStorage', 'keylogger', 'addEventListener("keydown"', 'addEventListener("keypress"'
            ]
            
            suspicious_scripts = []
            for script in scripts:
                script_content = script.string if script.string else ""
                if any(pattern in script_content.lower() for pattern in suspicious_script_patterns):
                    suspicious_scripts.append({
                        "src": script.get('src'),
                        "type": script.get('type'),
                        "patterns": [pattern for pattern in suspicious_script_patterns if pattern in script_content.lower()]
                    })
            
            results["hasSuspiciousScripts"] = len(suspicious_scripts) > 0
            results["suspiciousScripts"] = suspicious_scripts[:5]  # Limit to 5 for performance
            
            # Analyze external resources
            external_hostname = urlparse(url).netloc
            
            # Get unique external domains from links, images, scripts, etc.
            all_resources = []
            
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.startswith(('http://', 'https://')) and external_hostname not in href:
                    all_resources.append(href)
            
            for img in soup.find_all('img', src=True):
                src = img['src']
                if src.startswith(('http://', 'https://')) and external_hostname not in src:
                    all_resources.append(src)
            
            for script in soup.find_all('script', src=True):
                src = script['src']
                if src.startswith(('http://', 'https://')) and external_hostname not in src:
                    all_resources.append(src)
            
            # Extract unique domains from resources
            unique_external_domains = set()
            for resource in all_resources:
                domain = urlparse(resource).netloc
                if domain and domain != external_hostname:
                    unique_external_domains.add(domain)
            
            results["externalResourceCount"] = len(all_resources)
            results["externalDomains"] = list(unique_external_domains)[:10]  # Limit to 10
            
            # Determine if page has phishing indicators
            # Minimum criteria: login form + password field + (phishing keywords or suspicious scripts)
            results["phishingIndicators"] = (
                results["hasLoginForm"] and 
                results["hasPasswordField"] and 
                (results["hasPhishingKeywords"] or results["hasSuspiciousScripts"])
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Site content analysis error: {str(e)}")
            return {
                "error": str(e),
                "domainInfo": self._get_domain_info(url)
            }
    
    def _get_domain_info(self, url: str) -> Dict[str, Any]:
        """Get WHOIS and domain registration information"""
        try:
            parsed = urlparse(url)
            hostname = parsed.netloc.split(':')[0]
            
            # Skip IP addresses
            if self._is_valid_ip(hostname):
                return {
                    "hostname": hostname,
                    "is_ip": True
                }
            
            # For now, return simplified domain information
            # In production environment, this would call a proper WHOIS service
            domain_parts = hostname.split('.')
            
            return {
                "hostname": hostname,
                "is_ip": False,
                "domain": '.'.join(domain_parts[-2:]) if len(domain_parts) > 1 else hostname,
                "tld": domain_parts[-1] if len(domain_parts) > 1 else "",
                "registrationDate": None,  # Would come from WHOIS
                "expirationDate": None,    # Would come from WHOIS
                "registrar": None          # Would come from WHOIS
            }
            
        except Exception as e:
            logger.error(f"Domain info error: {str(e)}")
            return {"error": str(e)}
    
    def _check_virustotal(self, url: str) -> Dict[str, Any]:
        """
        Check a URL against VirusTotal
        
        Args:
            url: URL to check
            
        Returns:
            dict: VirusTotal result
        """
        try:
            # Prepare URL ID for API (base64 encoded)
            url_id = self._get_virustotal_url_id(url)
            
            # First try to get an existing analysis
            headers = {
                "x-apikey": self.virustotal_api_key,
                "Accept": "application/json"
            }
            
            # Lookup URL
            response = requests.get(
                f"{self.virustotal_url}/urls/{url_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract last analysis results
                last_analysis_results = result.get("data", {}).get("attributes", {}).get("last_analysis_results", {})
                last_analysis_stats = result.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                categories = result.get("data", {}).get("attributes", {}).get("categories", {})
                
                # Count detections
                malicious = last_analysis_stats.get("malicious", 0)
                suspicious = last_analysis_stats.get("suspicious", 0)
                total = sum(last_analysis_stats.values()) if last_analysis_stats else 0
                
                # Get threat categories
                threat_categories = list(set(categories.values()))
                
                # Determine if the URL is malicious
                is_malicious = (malicious > 0 or suspicious > 0)
                
                # Calculate confidence based on detection ratio
                confidence = 0.0
                if total > 0:
                    # Weighted formula: Malicious counts more than suspicious
                    confidence = min(0.99, (malicious + (suspicious * 0.5)) / total)
                
                return {
                    "isMalicious": is_malicious,
                    "confidence": confidence,
                    "detections": malicious + suspicious,
                    "total": total,
                    "scanDate": result.get("data", {}).get("attributes", {}).get("last_analysis_date"),
                    "threatCategories": threat_categories,
                    "reportLink": f"https://www.virustotal.com/gui/url/{url_id}/detection"
                }
            
            # If the URL hasn't been analyzed yet or there's an error, submit for scanning
            elif response.status_code in [404, 400]:
                # Submit URL for analysis
                scan_response = requests.post(
                    f"{self.virustotal_url}/urls",
                    headers=headers,
                    data={"url": url}
                )
                
                if scan_response.status_code == 200:
                    # URL has been submitted, but analysis might not be ready
                    return {
                        "isMalicious": False,
                        "confidence": 0.0,
                        "status": "submitted",
                        "message": "URL submitted for analysis"
                    }
                else:
                    return {
                        "isMalicious": False,
                        "confidence": 0.0,
                        "status": "error",
                        "error": f"Failed to submit URL: {scan_response.status_code}"
                    }
            else:
                return {
                    "isMalicious": False,
                    "confidence": 0.0,
                    "error": f"API Error: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"VirusTotal check error: {str(e)}")
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _get_virustotal_url_id(self, url: str) -> str:
        """Get VirusTotal URL identifier (base64 of URL)"""
        import base64
        return base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    
    def _check_google_safebrowsing(self, url: str) -> Dict[str, Any]:
        """
        Check a URL against Google Safe Browsing API
        
        Args:
            url: URL to check
            
        Returns:
            dict: Safe Browsing result
        """
        try:
            # Prepare API request
            threat_types = [
                "MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"
            ]
            
            platform_types = ["ANY_PLATFORM"]
            
            threat_entry_types = ["URL"]
            
            data = {
                "client": {
                    "clientId": "scambane",
                    "clientVersion": "1.0.0"
                },
                "threatInfo": {
                    "threatTypes": threat_types,
                    "platformTypes": platform_types,
                    "threatEntryTypes": threat_entry_types,
                    "threatEntries": [{"url": url}]
                }
            }
            
            # Make API request
            params = {"key": self.safebrowsing_api_key}
            response = requests.post(self.safebrowsing_url, params=params, json=data)
            
            if response.status_code != 200:
                return {
                    "isMalicious": False,
                    "confidence": 0.0,
                    "error": f"API Error: {response.status_code}"
                }
            
            result = response.json()
            
            # Check if matches were found
            if "matches" in result:
                # Process matches
                matches = result["matches"]
                threat_types = list(set(match["threatType"] for match in matches))
                
                return {
                    "isMalicious": True,
                    "confidence": 0.95,  # Google Safe Browsing has high reliability
                    "threatTypes": threat_types,
                    "matches": matches
                }
            
            # No matches found
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "message": "No threats found"
            }
            
        except Exception as e:
            logger.error(f"Google SafeBrowsing check error: {str(e)}")
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _check_urlhaus(self, url: str) -> Dict[str, Any]:
        """
        Check a URL against URLhaus
        
        Args:
            url: URL to check
            
        Returns:
            dict: URLhaus result
        """
        try:
            # Make API request
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            if self.urlhaus_api_key:
                headers["Authorization"] = f"Bearer {self.urlhaus_api_key}"
            
            data = {"url": url}
            response = requests.post(f"{self.urlhaus_url}/url/", headers=headers, json=data)
            
            if response.status_code != 200:
                return {
                    "isMalicious": False,
                    "confidence": 0.0,
                    "error": f"API Error: {response.status_code}"
                }
            
            result = response.json()
            
            # Check if URL is in URLhaus database
            if result.get("query_status") == "ok":
                # URL found in database
                return {
                    "isMalicious": True,
                    "confidence": 0.9,
                    "status": result.get("url_status"),
                    "threatType": result.get("threat_type", "malware"),
                    "dateAdded": result.get("date_added"),
                    "reporter": result.get("reporter"),
                    "payload": result.get("payload")
                }
            
            # URL not in database
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "message": "URL not found in database"
            }
            
        except Exception as e:
            logger.error(f"URLhaus check error: {str(e)}")
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _check_maltiverse(self, url: str) -> Dict[str, Any]:
        """
        Check a URL against Maltiverse
        
        Args:
            url: URL to check
            
        Returns:
            dict: Maltiverse result
        """
        try:
            # Make API request
            headers = {
                "Authorization": f"Bearer {self.maltiverse_api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # Encode URL in the API endpoint
            encoded_url = urllib.parse.quote_plus(url)
            response = requests.get(f"{self.maltiverse_url}/{encoded_url}", headers=headers)
            
            if response.status_code == 404:
                # URL not found in database
                return {
                    "isMalicious": False,
                    "confidence": 0.0,
                    "message": "URL not found in database"
                }
            
            if response.status_code != 200:
                return {
                    "isMalicious": False,
                    "confidence": 0.0,
                    "error": f"API Error: {response.status_code}"
                }
            
            result = response.json()
            
            # Check if URL is marked as malicious
            is_malicious = result.get("is_malicious", False)
            
            if is_malicious:
                return {
                    "isMalicious": True,
                    "confidence": 0.85,
                    "classification": result.get("classification"),
                    "firstSeen": result.get("first_seen"),
                    "lastSeen": result.get("last_seen"),
                    "tags": result.get("tags", [])
                }
            
            # URL found but not malicious
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "message": "URL found but not classified as malicious"
            }
            
        except Exception as e:
            logger.error(f"Maltiverse check error: {str(e)}")
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _check_abuseipdb(self, ip: str) -> Dict[str, Any]:
        """
        Check an IP address against AbuseIPDB
        
        Args:
            ip: IP address to check
            
        Returns:
            dict: AbuseIPDB result
        """
        try:
            # Make API request
            headers = {
                "Key": self.abuseipdb_api_key,
                "Accept": "application/json"
            }
            
            params = {
                "ipAddress": ip,
                "maxAgeInDays": 90
            }
            
            response = requests.get(self.abuseipdb_url, headers=headers, params=params)
            
            if response.status_code != 200:
                return {
                    "isMalicious": False,
                    "confidence": 0.0,
                    "error": f"API Error: {response.status_code}"
                }
            
            result = response.json()
            data = result.get("data", {})
            
            # Get abuse score
            abuse_score = data.get("abuseConfidenceScore", 0)
            
            # Determine if IP is malicious (adjust threshold as needed)
            is_malicious = abuse_score >= 50
            
            # Calculate confidence
            confidence = min(0.95, abuse_score / 100.0)
            
            return {
                "isMalicious": is_malicious,
                "confidence": confidence,
                "abuseScore": abuse_score,
                "ipAddress": data.get("ipAddress"),
                "countryCode": data.get("countryCode"),
                "totalReports": data.get("totalReports", 0),
                "lastReportedAt": data.get("lastReportedAt")
            }
            
        except Exception as e:
            logger.error(f"AbuseIPDB check error: {str(e)}")
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _check_ipqualityscore(self, url: str) -> Dict[str, Any]:
        """
        Check a URL with IP Quality Score
        
        Args:
            url: URL to check
            
        Returns:
            dict: IP Quality Score result
        """
        try:
            # Make API request
            api_url = f"{self.ipqualityscore_url}/{self.ipqualityscore_api_key}/{urllib.parse.quote_plus(url)}"
            
            params = {
                "strictness": 2,  # Medium strictness
                "fast": "false",   # Full analysis
                "timeout": 10
            }
            
            response = requests.get(api_url, params=params)
            
            if response.status_code != 200:
                return {
                    "isMalicious": False,
                    "confidence": 0.0,
                    "error": f"API Error: {response.status_code}"
                }
            
            result = response.json()
            
            # Check if URL is suspicious or malicious
            is_malicious = (
                result.get("suspicious", False) or 
                result.get("phishing", False) or 
                result.get("malware", False) or 
                result.get("spamming", False)
            )
            
            # Calculate confidence
            risk_score = result.get("risk_score", 0)
            confidence = min(0.95, risk_score / 100.0)
            
            return {
                "isMalicious": is_malicious,
                "confidence": confidence,
                "riskScore": risk_score,
                "suspicious": result.get("suspicious", False),
                "phishing": result.get("phishing", False),
                "malware": result.get("malware", False),
                "spamming": result.get("spamming", False),
                "adult": result.get("adult", False),
                "domain": result.get("domain"),
                "server": result.get("server"),
                "spamming": result.get("spamming", False),
                "unsafe": result.get("unsafe", False)
            }
            
        except Exception as e:
            logger.error(f"IP Quality Score check error: {str(e)}")
            return {
                "isMalicious": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _calculate_overall_confidence(self, results: Dict[str, Any]) -> None:
        """Calculate the overall confidence level based on all detection methods"""
        confidence_sum = 0.0
        weight_sum = 0.0
        
        # Define weights for different detection services
        weights = {
            "virusTotal": 3.0,
            "googleSafeBrowsing": 4.0,
            "urlHaus": 3.0,
            "maltiverse": 2.5,
            "abuseIPDB": 1.0,  # Lower weight as IP reputation isn't directly URL reputation
            "ipQualityScore": 2.5
        }
        
        # Calculate weighted average
        for service, result in results["detectionsByService"].items():
            if isinstance(result, dict) and "confidence" in result:
                weight = weights.get(service, 1.0)
                
                # Only include AbuseIPDB if it's a strong signal
                if service == "abuseIPDB" and result.get("abuseScore", 0) < 80:
                    continue
                    
                confidence_sum += result["confidence"] * weight
                weight_sum += weight
        
        # Update overall confidence
        if weight_sum > 0:
            results["confidence"] = min(0.99, confidence_sum / weight_sum)
        
        # If detected by multiple sources, increase confidence
        detection_count = len(results["detectionMethods"])
        if detection_count > 1:
            # Boost confidence based on number of detections
            results["confidence"] = min(0.99, results["confidence"] * (1.0 + (detection_count - 1) * 0.1))
        
        # If the content analysis shows strong phishing indicators, boost confidence
        if results.get("contentAnalysis", {}).get("phishingIndicators", False):
            results["confidence"] = min(0.99, results["confidence"] + 0.1)

# Create singleton instance
url_analyzer = URLAnalyzer()

# API function to be called from Node.js
def analyze_url(url: str) -> Dict[str, Any]:
    """API function for Node.js integration"""
    return url_analyzer.analyze_url(url)

# Command line testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python url_analysis_service.py <url>")
        sys.exit(1)
    
    result = url_analyzer.analyze_url(sys.argv[1])
    print(json.dumps(result, indent=2))