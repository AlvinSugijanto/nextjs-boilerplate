"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateData } from "@/utils/collection";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function DownloadModal({ isOpen, onClose, brochureType }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const { createData } = useCreateData();

  const emailContent = (brochureId) => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const fullUrl = `${protocol}//${host}`;

    const imageUrl = process.env.NEXT_PUBLIC_LOGO_URL;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nawadhya Brochure</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #264A8A;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .logo-container {
            margin-bottom: 0px;
        }
        .logo-img {
            max-width: 180px;
            height: auto;
            max-height: 60px;
        }
        .content {
            padding: 30px;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 25px;
            color: #444444;
        }
        .download-button {
            display: block;
            width: 220px;
            margin: 30px auto;
            background-color: #264A8A;
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(30, 60, 114, 0.3);
        }
        .footer {
            background-color: #f1f5f9;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e1e8f0;
        }
        .team-signature {
            margin-top: 20px;
            font-weight: bold;
            color: #1e3c72;
            font-size: 18px;
        }
        .disclaimer {
            margin-top: 20px;
            font-size: 12px;
            color: #666666;
            font-style: italic;
            line-height: 1.5;
        }
        .contact-info {
            margin-top: 15px;
            font-size: 14px;
            color: #444444;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-container">
                <img src="${imageUrl}" alt="Nawadhya Logo" class="logo-img" />
            </div>
        </div>
        
        <div class="content">
            <p class="message">
                Thank you for visiting Nawadhya.
            </p>
            
            <p class="message">
                To learn more about our solutions and offerings, please click the button below to download our brochure.
            </p>
            
            <a href="${fullUrl}/resources?id=${brochureId}" 
              class="download-button"
              target="_blank"
              rel="noopener noreferrer">
              Download Brochure
            </a>
            
            <p class="message">
                Thank you for your interest.
            </p>
            
            <div class="team-signature">
                Nawadhya Team
            </div>
        </div>
        
        <div class="footer">
            <p class="disclaimer">
                Please do not reply to this email. This is an automated message.
            </p>
            
            <div class="contact-info">
                For inquiries, please contact us at: padma.nawadhya@bodha.co.id
            </div>
        </div>
    </div>
</body>
</html>
`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      // create to pb
      const response = await createData("/api/collection/listCustomer", {
        ...formData,
        status: "unverified",
        type: brochureType,
      });

      // ===== EMAIL TITLE & SUBJECT =====
      const emailSubject = `${brochureType} Request`;

      // ===== SEND EMAIL =====
      const payloadEmail = new FormData();

      payloadEmail.append("subject", emailSubject);
      payloadEmail.append("content", emailContent(response.data.id));
      payloadEmail.append("receiver_emails", formData.email);

      await axios.post("/api/email", payloadEmail, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `Thank you! Please check your email to download ${brochureType}.`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      onClose();
      setLoading(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#3d5266] border-none text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal">
            Download Resources
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-gray-300">
          Please fill your informations below to download Nawadhya Brochure.
        </DialogDescription>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name Input */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
            />
          </div>

          {/* Email Input */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
            />
          </div>

          {/* Phone Number Input */}
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              className="bg-teal-500 hover:bg-teal-600 text-white px-7 py-4 rounded-3xl"
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
