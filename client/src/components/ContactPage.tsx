import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from './icons';
import { Button, Input, Textarea, Card } from './ui';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-accent-yellow/20 rounded-full animate-float backdrop-blur-sm"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-success-emerald/20 rounded-full animate-float-delayed backdrop-blur-sm"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="heading-hero mb-8 text-white">
              Get in Touch
            </h1>
            <p className="text-body-lg mb-12 text-neutral-100">
              Have questions about our properties or investment opportunities? Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card variant="modern" className="p-8 sticky top-4">
              <h2 className="text-2xl font-bold text-primary-blue mb-8">Contact Information</h2>
              
              <div className="space-y-8">
                {/* Office */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-blue mb-2">Our Office</h3>
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-accent-yellow mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-neutral-600">
                        123 Wall Street, Suite 456<br />
                        New York, NY 10005
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Phone */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-blue mb-2">Phone</h3>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-accent-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-neutral-600">(212) 555-0123</p>
                  </div>
                </div>
                
                {/* Email */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-blue mb-2">Email</h3>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-accent-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-neutral-600">info@investorpropertiesny.com</p>
                  </div>
                </div>
                
                {/* Hours */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-blue mb-2">Office Hours</h3>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-accent-yellow mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-neutral-600">
                        Monday - Friday: 9AM - 6PM EST<br />
                        Saturday: 10AM - 4PM EST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-lg font-semibold text-primary-blue mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-neutral-400 hover:text-accent-yellow transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-neutral-400 hover:text-accent-yellow transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-neutral-400 hover:text-accent-yellow transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-neutral-400 hover:text-accent-yellow transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card variant="modern" className="p-8">
              <h2 className="text-2xl font-bold text-primary-blue mb-8">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-primary-blue mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-primary-blue mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-primary-blue mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-primary-blue mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <option value="">Select a subject</option>
                    <option value="property-inquiry">Property Inquiry</option>
                    <option value="investment-opportunity">Investment Opportunity</option>
                    <option value="partnership">Partnership</option>
                    <option value="general-question">General Question</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-primary-blue mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  ></textarea>
                </div>
                
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}
                
                {submitSuccess && (
                  <div className="bg-success-green/10 border border-success-green/20 rounded-lg p-4">
                    <p className="text-sm text-success-green">
                      Thank you for your message! We'll get back to you within 24 hours.
                    </p>
                  </div>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-4 rounded-2xl text-lg font-semibold bg-gradient-primary hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </Card>
            
            {/* FAQ Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-primary-blue mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <Card variant="modern" className="p-6">
                  <h3 className="font-semibold text-primary-blue mb-2">How quickly do you respond to inquiries?</h3>
                  <p className="text-neutral-600">
                    We typically respond to all inquiries within 24 hours during business days. 
                    For urgent matters, please call our office directly.
                  </p>
                </Card>
                
                <Card variant="modern" className="p-6">
                  <h3 className="font-semibold text-primary-blue mb-2">Do you offer property viewings?</h3>
                  <p className="text-neutral-600">
                    Yes, we offer private property viewings for qualified investors. 
                    Please contact us to schedule a viewing and provide some information about your investment experience.
                  </p>
                </Card>
                
                <Card variant="modern" className="p-6">
                  <h3 className="font-semibold text-primary-blue mb-2">What information do you need to evaluate my property?</h3>
                  <p className="text-neutral-600">
                    For property evaluations, we typically need the address, property type, size, condition, 
                    and any recent comparable sales in the area. You can start by filling out our property submission form.
                  </p>
                </Card>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/faq" className="text-accent-yellow hover:text-accent-yellow-light font-medium">
                  View All Frequently Asked Questions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;