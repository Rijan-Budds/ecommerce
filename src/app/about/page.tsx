import PixelTransition from "@/components/PixelTransition";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { FaLightbulb, FaShieldAlt, FaHeart } from "react-icons/fa";

const teamMembers = [
  {
    name: "Aastha Malla",
    role: "Founder & CEO",
    image: "/home/rejina.jpg",
    description:
      "Visionary leader and passionate about building amazing products.",
  },
  {
    name: "Parisma Buddhacharya",
    role: "Lead Designer",
    image: "/home/parisma.jpg",
    description:
      "Creative mind behind our sleek and user-friendly designs.",
  },
  {
    name: "Rina Buddhacharya",
    role: "Senior Developer",
    image: "/home/asdf.jpg",
    description:
      "Code ninja making sure everything runs smoothly and efficiently.",
  },
];

const values = [
  {
    icon: <FaShieldAlt className="text-3xl" />,
    title: "Quality Assurance",
    description: "We strive for excellence and ensure the highest standards in every product.",
  },
  {
    icon: <FaHeart className="text-3xl" />,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We listen, understand, and deliver solutions that exceed expectations.",
  },
  {
    icon: <FaLightbulb className="text-3xl" />,
    title: "Innovation",
    description: "Constantly pushing boundaries to create cutting-edge solutions that drive the future.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                         We&apos;re passionate about creating exceptional products that enhance your digital experience. 
             Our journey is driven by innovation, quality, and unwavering commitment to customer satisfaction.
          </p>
        </div>

        {/* Our Story Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                                 Founded with a vision to revolutionize digital experiences, we&apos;ve grown from a small startup 
                 to a trusted name in technology. Our journey began with a simple belief: that technology 
                 should be both powerful and accessible to everyone.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, we continue to push boundaries, creating innovative solutions that empower businesses 
                and individuals alike. Every product we build reflects our commitment to excellence, 
                user-centered design, and cutting-edge technology.
              </p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Image
                src="/home/office.jpg"
                alt="Our story"
                width={500}
                height={400}
                className="w-full h-[400px] object-cover rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and every decision we make.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(({ icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 group">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-700 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meet Our Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The talented individuals behind our success, dedicated to bringing you the best products.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map(({ name, role, image, description }) => (
              <div key={name} className="group">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <PixelTransition
                    firstContent={
                      <Image
                        src={image}
                        alt={name}
                        width={400}
                        height={500}
                        className="w-full h-[400px] object-cover"
                      />
                    }
                    secondContent={
                      <div className="w-full h-[400px] bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] text-white flex flex-col justify-center items-center p-8 text-center">
                        <h3 className="text-2xl font-bold mb-2">{name}</h3>
                        <p className="text-lg font-medium mb-4 text-blue-100">{role}</p>
                        <p className="text-blue-50 leading-relaxed">{description}</p>
                      </div>
                    }
                    gridSize={12}
                    pixelColor="#ffffff"
                    animationStepDuration={0.4}
                    className="custom-pixel-card"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent mb-2">
                50+
              </div>
              <div className="text-gray-600">Products Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent mb-2">
                5+
              </div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
