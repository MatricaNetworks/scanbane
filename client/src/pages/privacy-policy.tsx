import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl bg-white text-black">
      <div className="mb-8">
        <Button variant="ghost" asChild size="sm">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="prose prose-lg max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-gray-600">Last updated: May 6, 2025</p>
        
        <p>
          This Privacy Policy describes how Matrica Networks Private Limited ("we", "us", or "our") 
          collects, uses, and shares your personal information when you use the ScamBane platform 
          ("Service"). This document also explains the choices you have regarding your personal data 
          and how you can exercise those rights.
        </p>
        
        <h2>GDPR Compliance Statement</h2>
        <p>
          We comply with the General Data Protection Regulation (GDPR) as it applies to users in the European 
          Economic Area (EEA). We act as a data controller for the personal information we collect and process 
          through the ScamBane platform.
        </p>
        
        <h2>Information We Collect</h2>
        <p>
          We collect several different types of information for various purposes to provide and improve
          our Service to you:
        </p>
        
        <h3>Personal Data</h3>
        <ul>
          <li><strong>Account Information:</strong> When you register for an account, we collect your username, email address, and password.</li>
          <li><strong>Mobile Phone Number:</strong> If you choose to use our mobile authentication features, we collect your phone number for OTP verification.</li>
          <li><strong>Payment Information:</strong> For premium subscriptions, we collect payment details through our secure payment processors.</li>
          <li><strong>Usage Data:</strong> We collect information about how you use the Service, including scan history, features used, and interaction patterns.</li>
        </ul>
        
        <h3>Scan Data</h3>
        <p>
          When you use our scanning features, we process:
        </p>
        <ul>
          <li><strong>URLs:</strong> Web addresses you submit for security analysis.</li>
          <li><strong>Files:</strong> Files you upload for security scanning, including but not limited to documents, images, APKs, audio, and video files.</li>
          <li><strong>Scan Results:</strong> Security analysis reports based on your submitted content.</li>
        </ul>
        <p>
          <strong>Important:</strong> While we process the content you submit for scanning, we do not retain the actual uploaded files longer than 
          necessary to complete the security analysis. Files are automatically deleted after analysis is complete, typically within 24 hours.
        </p>
        
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To provide, maintain, and improve the ScamBane service</li>
          <li>To detect, prevent, and address technical issues and security threats</li>
          <li>To generate scan reports and security analyses</li>
          <li>To process your subscription and manage your account</li>
          <li>To communicate with you about your account, updates, or support requests</li>
          <li>To comply with legal obligations</li>
        </ul>
        
        <h2>Legal Basis for Processing (GDPR)</h2>
        <p>
          We process your personal data on the following legal grounds:
        </p>
        <ul>
          <li><strong>Contract Performance:</strong> Processing necessary to provide you with the Service as per our Terms of Service.</li>
          <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate interests, such as improving our Service, preventing fraud, and ensuring security.</li>
          <li><strong>Consent:</strong> Where we have obtained your explicit consent for specific processing activities.</li>
          <li><strong>Legal Obligations:</strong> Processing necessary for compliance with our legal obligations.</li>
        </ul>
        
        <h2>Data Sharing and Third-party Services</h2>
        <p>
          We may share your information with:
        </p>
        <ul>
          <li><strong>Security API Providers:</strong> To perform security analyses, we use third-party security services including VirusTotal, Google SafeBrowsing, AbuseIPDB, IPQualityScore, Maltiverse, and URLhaus.</li>
          <li><strong>AI Analysis:</strong> We utilize artificial intelligence services for advanced threat detection and analysis.</li>
          <li><strong>Service Providers:</strong> Companies that help us provide our Service (hosting, payment processing, analytics).</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
        </ul>
        
        <h2>Data Retention</h2>
        <p>
          We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
        </p>
        <ul>
          <li>Account information is retained while your account is active.</li>
          <li>Scan history is maintained according to your subscription tier (30 days for free users, longer for premium users).</li>
          <li>Uploaded files are deleted within 24 hours after analysis is complete.</li>
        </ul>
        
        <h2>Your Data Protection Rights (GDPR)</h2>
        <p>
          If you are in the EEA, you have the following rights regarding your personal data:
        </p>
        <ul>
          <li><strong>Right to Access:</strong> You can request copies of your personal data.</li>
          <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data.</li>
          <li><strong>Right to Erasure:</strong> You can request deletion of your data in certain circumstances.</li>
          <li><strong>Right to Restrict Processing:</strong> You can request limiting how we use your data.</li>
          <li><strong>Right to Data Portability:</strong> You can request a copy of your data in a machine-readable format.</li>
          <li><strong>Right to Object:</strong> You can object to our processing of your data.</li>
          <li><strong>Rights Related to Automated Decision Making:</strong> You have rights related to automated decision-making and profiling.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at privacy@scambane.com.
        </p>
        
        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data, including:
        </p>
        <ul>
          <li>Encryption of sensitive data in transit and at rest</li>
          <li>Regular security assessments and audits</li>
          <li>Strict access controls for employee access to user data</li>
          <li>Sandboxing of uploaded files for secure analysis</li>
          <li>Regular deletion of uploaded files after analysis</li>
        </ul>
        
        <h2>Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. 
          When we transfer personal data outside the EEA, we ensure appropriate safeguards are in place in compliance with GDPR requirements.
        </p>
        
        <h2>Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all 
          cookies or to indicate when a cookie is being sent.
        </p>
        
        <h2>Children's Privacy</h2>
        <p>
          The Service is not intended for use by children under the age of 16. We do not knowingly collect personal information from children under 16. 
          If you become aware that a child has provided us with personal information, please contact us.
        </p>
        
        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and 
          updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </p>
        
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our data practices, please contact us at:
        </p>
        <p>
          Matrica Networks Private Limited<br />
          Email: privacy@scambane.com
        </p>
        
        <div className="mt-12 border-t pt-6">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} ScamBane by Matrica Networks Private Limited. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}