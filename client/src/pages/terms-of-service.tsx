import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild size="sm">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: May 6, 2025</p>
        
        <p>
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the 
          ScamBane platform ("Service") operated by Matrica Networks Private Limited ("us", "we", or "our").
        </p>
        
        <p>
          Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. 
          These Terms apply to all visitors, users, and others who access or use the Service.
        </p>
        
        <h2>1. Accounts and Registration</h2>
        <p>
          When you create an account with us, you must provide accurate, complete, and current information. 
          Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>
        
        <p>
          You are responsible for safeguarding the password that you use to access the Service and for any activities 
          or actions under your password, whether your password is with our Service or a third-party service.
        </p>
        
        <h2>2. Service Description</h2>
        <p>
          ScamBane is a cybersecurity platform that offers scanning and analysis of various digital content including:
        </p>
        <ul>
          <li>URL analysis for phishing and malicious websites</li>
          <li>File scanning for malware and viruses</li>
          <li>Image scanning for steganography and hidden content</li>
          <li>APK analysis for potentially harmful applications</li>
          <li>Audio and video analysis for steganography and security threats</li>
        </ul>
        
        <h2>3. Subscription Tiers and Billing</h2>
        <p>
          We offer the following subscription options:
        </p>
        <ul>
          <li><strong>Free Tier:</strong> Limited number of scans per day with basic threat detection features.</li>
          <li><strong>Premium:</strong> Increased scan limits, advanced detection features, and extended history retention.</li>
          <li><strong>Enterprise:</strong> Custom solutions for organizations with tailored features and support options.</li>
        </ul>
        
        <p>
          Subscription fees are billed in advance on a monthly or annual basis, depending on your selected plan. 
          Payment will be charged to your designated payment method at confirmation of purchase. 
          Subscription fees are non-refundable except as required by applicable law.
        </p>
        
        <h2>4. User Content and Scanning</h2>
        <p>
          Our Service allows you to upload and scan various forms of content ("User Content") for security analysis. You retain all rights to your User Content.
        </p>
        
        <p>By uploading User Content to the Service, you:</p>
        <ul>
          <li>Grant us a limited license to process and analyze that content for security purposes</li>
          <li>Represent that you have all necessary rights to submit such content for scanning</li>
          <li>Understand that we will delete the actual files within 24 hours after scanning</li>
          <li>Acknowledge that scan results and metadata may be retained according to our Privacy Policy</li>
        </ul>
        
        <p>
          You must not upload:
        </p>
        <ul>
          <li>Content that violates any law or regulations</li>
          <li>Highly sensitive personal information unrelated to security scanning purposes</li>
          <li>Content that infringes on the intellectual property rights of others</li>
          <li>Content that you do not have the right to submit for analysis</li>
        </ul>
        
        <h2>5. Intellectual Property</h2>
        <p>
          The Service and its original content (excluding User Content), features, and functionality are and will remain the 
          exclusive property of Matrica Networks Private Limited and its licensors. The Service is protected by copyright, 
          trademark, and other laws of both the India and foreign countries.
        </p>
        
        <p>
          Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent 
          of Matrica Networks Private Limited.
        </p>
        
        <h2>6. Limitation of Liability</h2>
        <p>
          In no event shall Matrica Networks Private Limited, nor its directors, employees, partners, agents, suppliers, or affiliates, 
          be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
          data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ol type="a">
          <li>Your access to or use of or inability to access or use the Service;</li>
          <li>Any conduct or content of any third party on the Service;</li>
          <li>Any content obtained from the Service; and</li>
          <li>Unauthorized access, use or alteration of your transmissions or content,</li>
        </ol>
        <p>
          whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed 
          of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
        </p>
        
        <h2>7. Disclaimer</h2>
        <p>
          Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is 
          provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of 
          merchantability, fitness for a particular purpose, non-infringement or course of performance.
        </p>
        
        <p>
          While ScamBane uses advanced technology to detect threats, no security scanning technology is perfect or 100% effective. 
          We do not guarantee that our Service will detect all security threats, nor that content deemed safe is completely free from any threats.
        </p>
        
        <h2>8. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
        </p>
        
        <p>
          Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision 
          of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
        </p>
        
        <h2>9. GDPR Compliance</h2>
        <p>
          For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR). Please refer to our 
          Privacy Policy for details on how we process personal data and what rights you have regarding your data.
        </p>
        
        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any 
          significant changes to these Terms through the Service. What constitutes a significant change will be determined at our sole discretion.
        </p>
        
        <p>
          By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised Terms. 
          If you do not agree to the new Terms, please stop using the Service.
        </p>
        
        <h2>11. Termination</h2>
        <p>
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, 
          including without limitation if you breach the Terms.
        </p>
        
        <p>
          All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, 
          ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
        </p>
        
        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p>
          Matrica Networks Private Limited<br />
          Email: legal@scambane.com
        </p>
        
        <div className="mt-12 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ScamBane by Matrica Networks Private Limited. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}