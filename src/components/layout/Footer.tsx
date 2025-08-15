import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-8">

        {/* Company Info */}
        <div className="text-left md:w-1/3">
          <h2 className="text-2xl font-bold mb-2">Tech Store</h2>
          <p className="text-sm mb-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae, excepturi accusamus repellat expedita provident, hic minus ipsa, maxime corporis a culpa repudiandae labore.
          </p>
          <p className="text-xs opacity-80">
            © {new Date().getFullYear()} Tech Store. All rights reserved.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col text-sm space-y-2 md:w-1/3">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/about" className="hover:underline">About Us</Link>
          <Link href="/services" className="hover:underline">Services</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </nav>

        {/* Social Icons */}
        <div className="flex space-x-4 text-2xl md:w-1/3">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-200 transition-colors">
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-200 transition-colors">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-200 transition-colors">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gray-200 transition-colors">
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
