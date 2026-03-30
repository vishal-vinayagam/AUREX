/**
 * Terms and Conditions Page - AUREX Civic Issue Reporting System
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/login" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-blue-100">AUREX Civic Issue Reporting System</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card rounded-lg shadow-md p-8 space-y-8">
          
          {/* About AUREX */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">About AUREX</h2>
            <p className="text-muted-foreground mb-4">
              AUREX is a comprehensive web-based platform for reporting, tracking, and managing civic issues in urban areas. 
              It serves as a bridge between citizens and municipal authorities, enabling efficient issue resolution and community engagement.
            </p>
          </section>

          {/* Project Overview */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Project Overview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Objectives</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Enable citizens to easily report civic issues with detailed information</li>
                  <li>Provide transparency in issue resolution processes</li>
                  <li>Facilitate efficient resource allocation for authorities</li>
                  <li>Build community awareness through shared issue tracking</li>
                  <li>Support multi-language and accessibility features</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">4-Step Report Submission</h3>
                <p className="text-sm text-muted-foreground">Submit detailed reports with 16+ categories and media uploads</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Real-Time Status Tracking</h3>
                <p className="text-sm text-muted-foreground">Track issue resolution with live updates and notifications</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Community Engagement</h3>
                <p className="text-sm text-muted-foreground">Connect with other users and share insights</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Admin Dashboard</h3>
                <p className="text-sm text-muted-foreground">Manage and prioritize issue resolution</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Real-Time Messaging</h3>
                <p className="text-sm text-muted-foreground">Direct communication with authorities</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Location-Based Reporting</h3>
                <p className="text-sm text-muted-foreground">GPS integration for precise issue location</p>
              </div>
            </div>
          </section>

          {/* Report Categories */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Report Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Roads & Potholes',
                'Water Supply',
                'Electricity',
                'Sanitation',
                'Garbage Collection',
                'Street Lights',
                'Public Transport',
                'Parks & Recreation',
                'Noise Pollution',
                'Air Pollution',
                'Illegal Construction',
                'Traffic Issues',
                'Public Safety',
                'Healthcare',
                'Education',
                'Other'
              ].map((category) => (
                <div key={category} className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm font-medium text-center">
                  {category}
                </div>
              ))}
            </div>
          </section>

          {/* Technology Stack */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Frontend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>React 18</strong> - UI library with TypeScript</li>
                  <li><strong>Vite</strong> - Fast build tool</li>
                  <li><strong>Tailwind CSS</strong> - Utility-first styling</li>
                  <li><strong>shadcn/ui</strong> - Component library</li>
                  <li><strong>React Router v6</strong> - Client routing</li>
                  <li><strong>Socket.io</strong> - Real-time features</li>
                  <li><strong>React Hook Form</strong> - Form management</li>
                  <li><strong>Axios</strong> - HTTP client</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Backend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Node.js</strong> - Runtime environment</li>
                  <li><strong>Express.js</strong> - Web framework</li>
                  <li><strong>MongoDB</strong> - NoSQL database</li>
                  <li><strong>Mongoose</strong> - ODM for MongoDB</li>
                  <li><strong>JWT</strong> - Authentication</li>
                  <li><strong>Socket.io</strong> - Real-time communication</li>
                  <li><strong>Cloudinary</strong> - File storage</li>
                  <li><strong>Multer</strong> - File uploads</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Terms of Service */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Terms of Service</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                By using AUREX, you agree to comply with all applicable laws and regulations. Users must provide accurate information 
                when reporting civic issues. The platform is intended for legitimate reporting only, and any misuse will result in 
                account suspension or legal action.
              </p>
              <p>
                AUREX is not responsible for any damages or losses resulting from the use or inability to use the platform. 
                We reserve the right to modify, suspend, or discontinue the service at any time.
              </p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Privacy Policy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We collect personal information to provide and improve our services. Your data is protected using industry-standard 
                security measures. We do not share your personal information with third parties without your consent, except as required by law.
              </p>
              <p>
                For security and service improvement purposes, we may collect usage analytics and device information. 
                You can control your privacy settings in your account preferences.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide accurate and truthful information in all reports</li>
              <li>Respect the privacy and rights of other users</li>
              <li>Not engage in harassment, abuse, or threats</li>
              <li>Not submit false or misleading information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not attempt to access unauthorized areas of the platform</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              AUREX and its operators are not liable for any indirect, incidental, special, consequential, or punitive damages 
              arising from your use of or inability to use the platform, even if advised of the possibility of such damages. 
              Your sole remedy for dissatisfaction with the platform is to stop using it.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms and Conditions or for support, please contact us through the AUREX platform 
              or reach out to our support team.
            </p>
          </section>

          {/* Last Updated */}
          <section className="border-t pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Last updated: March 18, 2026 | AUREX Civic Issue Reporting System
            </p>
          </section>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/login">
            <Button variant="outline">Go Back to Login</Button>
          </Link>
          <Link to="/register">
            <Button>Create Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
