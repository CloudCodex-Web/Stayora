import React, { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Thanks for contacting Stayora! We'll get back to you soon.");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <section id="contact" className="bg-white px-5 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="mb-3 font-semibold uppercase tracking-widest text-blue-600">
            Get In Touch
          </p>

          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">
            Contact Stayora
          </h2>

          <p className="mx-auto max-w-2xl leading-7 text-gray-500">
            Have a question about your next stay? We would love to hear from
            you. Send us a message and let us help you plan your journey.
          </p>
        </div>

        {/* Contact Content */}
        <div className="grid gap-10 rounded-3xl bg-gray-50 p-6 md:grid-cols-2 md:p-10">
          {/* Left Side */}
          <div className="flex flex-col justify-center">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Let's make your next trip memorable.
            </h3>

            <p className="mb-8 leading-7 text-gray-600">
              Whether you need help finding a hotel or have a question about
              Stayora, send us a message using the form.
            </p>

            <div className="space-y-6">
              {/* Location */}
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="font-bold text-gray-900">Our Location</h4>
                  <p className="mt-1 text-gray-500">Kathmandu, Nepal</p>
                </div>
              </div>

              {/* Support */}
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="font-bold text-gray-900">Contact Support</h4>
                  <p className="mt-1 text-gray-500">
                    Questions about your next stay? We're here to help.
                  </p>
                </div>
              </div>

              {/* Response */}
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="font-bold text-gray-900">Quick Response</h4>
                  <p className="mt-1 text-gray-500">
                    Send your message anytime through our contact form.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl bg-white p-6 shadow-sm md:p-8"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Your Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="What is this about?"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Your Message
              </label>

              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition duration-300 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]"
            >
              Send Message →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
