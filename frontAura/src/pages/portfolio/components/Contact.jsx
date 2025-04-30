import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import { 
  Send,
  Loader2,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import api from '../../../api/axios';

export const Contact = ({ loading, portfolio, githubStats }) => {
  const { username } = useParams();
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sender_name.trim()) {
      newErrors.sender_name = 'Name is required';
    }
    
    if (formData.sender_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email)) {
      newErrors.sender_email = 'Please enter a valid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 2000) {
      newErrors.message = 'Message must be less than 2000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the error when I start typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Get session ID from localStorage
    const SESSION_ID_KEY = 'visitor_session_id';
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      setNotification({
        visible: true,
        message: 'Session not found. Please reload the page.',
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        session_id: sessionId
      };

      setFormData({
        sender_name: '',
        sender_email: '',
        message: ''
      });

      const response = await api.post(`/${username}/messages`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.status >= 400) {
        throw new Error(response.data?.message || 'Failed to send message');
      }
      
      setNotification({
        visible: true,
        message: 'Message sent successfully!',
        type: 'success'
      });
    } catch (error) {
      setFormData(prev => ({
        ...prev,
        ...formData
      }));

      setNotification({
        visible: true,
        message: error.response?.data?.message || 
                error.message || 
                'There was an error sending your message. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      visible: false
    }));
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => {
        closeNotification();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.visible]);

  const socials = portfolio?.owner?.socials ? JSON.parse(portfolio.owner.socials) : {};

  const socialLinks = [
    { icon: <InstagramIcon />, label: 'Instagram', link: socials.instagram || '#' },
    { icon: <TwitterIcon />, label: 'Twitter', link: socials.twitter || '#' },
    { icon: <GitHubIcon />, label: 'GitHub', link: socials.github || '#' },
    { icon: <LinkedInIcon />, label: 'LinkedIn', link: socials.linkedin || '#' },
    { icon: <EmailIcon />, label: 'Email', link: socials.email ? `mailto:${socials.email}` : 'mailto:theshamkhi1@gmail.com' },
  ];


  return (
    <div className="relative w-full py-32 overflow-hidden bg-gradient-to-b from-slate-950 to-indigo-950">
      {/* Animated particles background */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-full bg-[radial-gradient(circle,_#4f46e5_1px,_transparent_1px)] bg-[size:30px_30px] opacity-20" />
      </div>
      
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-30" />
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-blue-600/20 rounded-full filter blur-3xl opacity-20" />

      <div className="container relative z-10 max-w-6xl px-4 mx-auto">
        {/* Header section with animated underline */}
        <div className="relative text-center mb-16">
          <h2 className="mb-3 text-5xl font-bold text-white md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400">
            Let's Connect
          </h2>
          <div className="w-24 h-1 mx-auto mt-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <p className="max-w-xl mx-auto mt-6 text-lg text-indigo-100 opacity-80">
            Have a project in mind or want to collaborate? I'd love to hear from you!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-stretch relative">
          {/* Left Column - Bio Card */}
          <div className="flex-1 relative">
            {/* Card with glass effect */}
            <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg border border-slate-700/30 shadow-2xl h-full relative overflow-hidden group">
              {/* Subtle animated gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="flex flex-col items-center text-center relative">
                
                <h3 className="text-3xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  {loading ? (
                    <div className="h-9 rounded bg-slate-700 animate-pulse w-48 mx-auto"></div>
                  ) : (
                    portfolio?.owner?.name || "Uknown"
                  )}
                </h3>
                
                <p className="mb-6 text-lg text-indigo-300 font-medium">
                  {loading ? (
                    <div className="h-5 rounded bg-slate-700 animate-pulse w-36 mx-auto"></div>
                  ) : (
                    "@" + portfolio?.owner?.username || "Loading..."
                  )}
                </p>

                {/* Stats section */}
                <div className="grid grid-cols-3 w-sm gap-10 mb-10">
                  {[
                    { label: 'Projects', value: portfolio?.stats?.projects },
                    { label: 'Visitors', value: portfolio?.stats?.visitors?.total },
                    { label: 'Technologies', value: portfolio?.stats?.skills }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <h4 className="text-2xl font-bold text-white mb-1">{stat.value}</h4>
                      <p className="text-sm text-indigo-300">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                {/* the GitHub contributions chart */}
                <p className="mb-4 text-slate-300">
                    My evolving language stats, powered by GitHub activity
                </p>
                {/* the GitHub contributions chart */}
                <p className="mb-10 text-slate-300 max-w-md leading-relaxed">
                  <img 
                    src={githubStats?.charts?.languages || "https://github-readme-stats.vercel.app/api/top-langs/?username=theshamkhi&layout=compact&hide=blade,shell"} 
                    alt="GitHub language usage chart"
                    className="w-full"
                  />
                </p>
                
                {/* Social links with custom hover effects */}
                <div className="flex justify-center gap-5 mt-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={social.name}
                      href="#"
                      className={`flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-full bg-slate-800/70 text-slate-300 hover:text-white hover:-translate-y-2 hover:shadow-lg ${social.color}`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="flex-1 relative">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg border border-slate-700/30 shadow-2xl relative overflow-hidden">
              {/* Animated corner accent */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full opacity-20"></div>
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full opacity-20"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-600/20 rounded-xl">
                  <MessageSquare size={24} className="text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Send a Message</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name field */}
                  <div className="relative">
                    <label htmlFor="sender_name" className="block mb-2 text-sm font-medium text-indigo-200">
                      Your Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="sender_name"
                      name="sender_name"
                      value={formData.sender_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 rounded-xl bg-slate-800/30 border ${errors.sender_name ? 'border-red-500' : 'border-indigo-500/30'} text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-indigo-300/30`}
                      placeholder="John Wick"
                    />
                    {errors.sender_name && (
                      <p className="mt-1 text-sm text-red-400">{errors.sender_name}</p>
                    )}
                  </div>
                  
                  {/* Email field */}
                  <div className="relative">
                    <label htmlFor="sender_email" className="block mb-2 text-sm font-medium text-indigo-200">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="sender_email"
                      name="sender_email"
                      value={formData.sender_email}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 rounded-xl bg-slate-800/30 border ${errors.sender_email ? 'border-red-500' : 'border-indigo-500/30'} text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-indigo-300/30`}
                      placeholder="john@wick.com"
                    />
                    {errors.sender_email && (
                      <p className="mt-1 text-sm text-red-400">{errors.sender_email}</p>
                    )}
                  </div>
                </div>
                
                {/* Message field */}
                <div className="relative">
                  <label htmlFor="message" className="block mb-2 text-sm font-medium text-indigo-200">
                    Your Message <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 rounded-xl bg-slate-800/30 border ${errors.message ? 'border-red-500' : 'border-indigo-500/30'} text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none placeholder-indigo-300/30`}
                    placeholder="I'd like to discuss a project..."
                  ></textarea>
                  <div className="flex justify-between mt-1">
                    {errors.message ? (
                      <p className="text-sm text-red-400">{errors.message}</p>
                    ) : (
                      <span></span>
                    )}
                    <p className={`text-xs ${formData.message.length > 2000 ? 'text-red-400' : 'text-indigo-300'}`}>
                      {formData.message.length}/2000
                    </p>
                  </div>
                </div>
                
                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 text-base font-medium text-white transition-all bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/30 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-50 group-hover:animate-shimmer"></span>
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2 relative">
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 relative">
                        <Send size={20} />
                        Send Message
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Notification toast with improved styling */}
      {notification.visible && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px] backdrop-blur-lg ${
            notification.type === 'success' 
              ? 'bg-green-500/90 border border-green-400/30' 
              : 'bg-red-500/90 border border-red-400/30'
          }`}>
            <div className="flex-1 text-white font-medium">
              {notification.message}
            </div>
            <button 
              onClick={closeNotification} 
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Contact;