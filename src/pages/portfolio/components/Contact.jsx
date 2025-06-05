import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatedUnderline } from './Animation';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Send,
  Loader2,
  ChevronRight,
  MessageSquare,
  GitBranch,
  Activity
} from 'lucide-react';
import api from '../../../api/axios';

export const Contact = ({ loading, portfolio, githubStats }) => {
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

      const response = await api.post(`/messages`, payload, {
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
    { icon: <InstagramIcon />, label: 'Instagram', link: socials.instagram || '#', color: 'hover:text-pink-400' },
    { icon: <TwitterIcon />, label: 'Twitter', link: socials.twitter || '#', color: 'hover:text-blue-400' },
    { icon: <GitHubIcon />, label: 'GitHub', link: socials.github || '#', color: 'hover:text-gray-300' },
    { icon: <LinkedInIcon />, label: 'LinkedIn', link: socials.linkedin || '#', color: 'hover:text-blue-500' },
    { icon: <EmailIcon />, label: 'Email', link: socials.email ? `mailto:${socials.email}` : 'mailto:theshamkhi1@gmail.com', color: 'hover:text-red-400' },
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#4CC9F0', 
                letterSpacing: 4,
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              GET IN TOUCH
            </Typography>
          </motion.div>
          <h2 className="mb-3 text-5xl font-bold text-white md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400">
            Let's Connect
          </h2>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <AnimatedUnderline width="80px" />
          </Box>
          <p className="max-w-xl mx-auto mt-6 text-lg text-indigo-100 opacity-80">
            Have a project in mind or want to collaborate? I'd love to hear from you!
          </p>
        </div>

        {/* Main Content - Stacked Layout */}
        <div className="space-y-16">

          {/* Contact Form - Full Width */}
          <motion.div
            className="w-full max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="relative p-12 rounded-[2rem] bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl border border-slate-700/30 shadow-2xl overflow-hidden">
              
              {/* Decorative corner elements */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full opacity-20"></div>
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full opacity-20"></div>
              
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl">
                    <MessageSquare size={32} className="text-indigo-300" />
                  </div>
                  <h2 className="text-4xl font-bold text-white">Send a Message</h2>
                </div>
                <p className="text-lg text-indigo-200/80">
                  Let's start a conversation about your next project
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Name field */}
                  <div className="relative">
                    <label htmlFor="sender_name" className="block mb-3 text-base font-semibold text-indigo-200">
                      Your Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="sender_name"
                      name="sender_name"
                      value={formData.sender_name}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 text-lg rounded-2xl bg-slate-800/30 border-2 ${errors.sender_name ? 'border-red-500' : 'border-indigo-500/30'} text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder-indigo-300/40`}
                      placeholder="John Wick"
                    />
                    {errors.sender_name && (
                      <p className="mt-2 text-sm text-red-400">{errors.sender_name}</p>
                    )}
                  </div>
                  
                  {/* Email field */}
                  <div className="relative">
                    <label htmlFor="sender_email" className="block mb-3 text-base font-semibold text-indigo-200">
                      Your Email <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="sender_email"
                      name="sender_email"
                      value={formData.sender_email}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 text-lg rounded-2xl bg-slate-800/30 border-2 ${errors.sender_email ? 'border-red-500' : 'border-indigo-500/30'} text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder-indigo-300/40`}
                      placeholder="john.wick@example.com"
                    />
                    {errors.sender_email && (
                      <p className="mt-2 text-sm text-red-400">{errors.sender_email}</p>
                    )}
                  </div>
                </div>
                
                {/* Message field */}
                <div className="relative">
                  <label htmlFor="message" className="block mb-3 text-base font-semibold text-indigo-200">
                    Your Message <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-6 py-4 text-lg rounded-2xl bg-slate-800/30 border-2 ${errors.message ? 'border-red-500' : 'border-indigo-500/30'} text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none placeholder-indigo-300/40`}
                    placeholder="Hello, I would like to discuss..."
                  ></textarea>
                  <div className="flex justify-between mt-2">
                    {errors.message ? (
                      <p className="text-sm text-red-400">{errors.message}</p>
                    ) : (
                      <span></span>
                    )}
                    <p className={`text-sm ${formData.message.length > 2000 ? 'text-red-400' : 'text-indigo-300'}`}>
                      {formData.message.length}/2000
                    </p>
                  </div>
                </div>
                
                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-10 py-5 text-lg font-semibold text-white transition-all bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group cursor-pointer"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></span>
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-3 relative">
                        <Loader2 size={24} className="animate-spin" />
                        Sending your message...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3 relative">
                        <Send size={24} />
                        Send Message
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Social Links */}
              <div className="mt-12 pt-8 border-t border-slate-700/30">
                <p className="text-center text-indigo-200 mb-6 font-medium">
                  Or connect with me on social media
                </p>
                <div className="flex justify-center gap-6">
                  {socialLinks.map((social, index) => (
                    <a
                      key={social.label}
                      href={social.link}
                      className={`flex items-center justify-center w-14 h-14 transition-all duration-300 rounded-2xl bg-slate-800/50 text-slate-300 hover:text-white hover:-translate-y-2 hover:shadow-xl border border-slate-700/30 hover:border-indigo-400/50 ${social.color}`}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Notification */}
      {notification.visible && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[350px] backdrop-blur-xl border ${
            notification.type === 'success' 
              ? 'bg-green-500/90 border-green-400/30 text-white' 
              : 'bg-red-500/90 border-red-400/30 text-white'
          }`}>
            <div className="flex-1 font-medium text-lg">
              {notification.message}
            </div>
            <button 
              onClick={closeNotification} 
              className="text-white/80 hover:text-white transition-colors text-xl"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;