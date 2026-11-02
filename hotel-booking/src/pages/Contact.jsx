
import { useState } from "react";
import {
  MapPin,
  Mail,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  Headphones,
} from "lucide-react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSubmitted(false);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      setError("Please complete all fields before submitting.");
      return;
    }

    if (
      formData.name.trim().length < 2 ||
      formData.message.trim().length < 10
    ) {
      setError("Please enter a valid name and a message of at least 10 characters.");
      return;
    }

    // Frontend demo only. No live message delivery is configured.
    setSubmitted(true);
    setError("");
  }

  const contactItems = [
    {
      icon: MapPin,
      title: "Our Location",
      description: "Kathmandu, Nepal",
      detail: "Based in the heart of Nepal.",
    },
    {
      icon: MessageCircle,
      title: "Customer Support",
      description: "We're here to help",
      detail: "Questions about bookings and your next stay.",
    },
    {
      icon: Clock,
      title: "Send Anytime",
      description: "Contact form available anytime",
      detail: "Submit your enquiries whenever convenient.",
    },
  ];

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-gray-50 px-5 py-20 md:py-24"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
            <MessageCircle size={15} />
            Get in touch
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Let's Talk About Your
            <span className="block text-emerald-700">
              Next Stay
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500">
            Have a question or need assistance with your hotel booking?
            We'd love to hear from you. Send us a message and let us
            help make your journey easier.
          </p>
        </div>

        {/* Contact content */}
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">

          {/* Left side */}
          <div className="flex flex-col justify-between rounded-3xl bg-emerald-900 p-7 text-white sm:p-10">

            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Headphones size={29} />
              </div>

              <h3 className="mt-7 text-2xl font-bold sm:text-3xl">
                We're always happy to help.
              </h3>

              <p className="mt-4 leading-7 text-emerald-100">
                Whether you're planning your next getaway or need help
                understanding your booking, Stayora is here to make
                your hotel discovery experience easier.
              </p>

              {/* Contact information */}
              <div className="mt-10 space-y-7">
                {contactItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Icon size={22} className="text-emerald-200" />
                      </div>

                      <div>
                        <h4 className="font-bold text-white">
                          {item.title}
                        </h4>

                        <p className="mt-1 text-sm font-medium text-emerald-100">
                          {item.description}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-300">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom message */}
            <div className="mt-12 rounded-2xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">
                Your journey matters to us.
              </p>

              <p className="mt-2 text-sm leading-6 text-emerald-100">
                Discover amazing destinations and find a stay that
                makes every trip memorable.
              </p>
            </div>
          </div>

          {/* Right side - Contact form */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
            <div className="mb-8">
              <span className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                Send us a message
              </span>

              <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                How can we help you?
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Fill out the form below with your details and enquiry.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name and email */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Your Name
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    minLength={2}
                    maxLength={80}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={254}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="What would you like to discuss?"
                  value={formData.subject}
                  onChange={handleChange}
                  maxLength={120}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Message */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="contact-message"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Your Message
                  </label>

                  <span className="text-xs text-gray-400">
                    {formData.message.length}/1000
                  </span>
                </div>

                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={1000}
                  required
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Error feedback */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Success feedback */}
              {submitted && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                >
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 size={20} />
                    Form completed successfully!
                  </div>

                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    Your message is ready. This demo currently does
                    not send messages to a live support inbox.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-emerald-800 hover:shadow-lg active:scale-[0.99]"
              >
                <Send size={19} />
                Submit Message
              </button>

              <p className="text-center text-xs text-gray-400">
                Thank you for getting in touch with Stayora.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
s