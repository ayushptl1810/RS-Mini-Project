import { Link } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import World from "../components/ui/Globe";

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: <SparklesIcon className="h-12 w-12" />,
      title: "AI-Powered Job Recommendations",
      description:
        "Get personalized job role suggestions based on your resume and experience.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <MagnifyingGlassIcon className="h-12 w-12" />,
      title: "Smart Tech Stack Matching",
      description:
        "Discover what technologies you need to learn for your dream role.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <UserCircleIcon className="h-12 w-12" />,
      title: "Personalized Job Listings",
      description:
        "Browse job postings filtered specifically for your skills and interests.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    {
      icon: <UsersIcon className="h-8 w-8" />,
      value: "50K+",
      label: "Active Users",
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      value: "95%",
      label: "Match Accuracy",
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      value: "2min",
      label: "Avg Response",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative w-full lg:ml-auto"
            >
              <div className="w-full h-[560px] md:h-[620px] lg:h-[680px]">
                <World />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 relative z-10 w-full lg:max-w-2xl"
            >
              <div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                  Find Your Perfect Tech Career
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  AI-powered job recommendations tailored to your skills and
                  aspirations. Connect with opportunities worldwide.
                </p>
              </div>

              <div className="flex flex-row flex-nowrap gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-gray-950 border border-gray-900 rounded-xl px-6 py-4"
                  >
                    <div className="text-cyan-400">{stat.icon}</div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/jobs"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Browse Jobs
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/auth/register"
                    className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 rounded-xl font-semibold hover:bg-cyan-400 hover:text-black transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    Get Started Free
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">
              Three simple steps to your dream job
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 bg-gradient-to-br from-blue-400/40 to-purple-400/40 rounded-3xl" />
                <div className="relative bg-gray-950 border border-gray-800 p-8 rounded-3xl hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`flex-shrink-0 p-3 rounded-2xl bg-gradient-to-r ${feature.gradient}`}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-20 relative z-10 bg-black">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-1">
              <div className="bg-black rounded-3xl p-12 text-center">
                <h2 className="text-4xl font-bold mb-4 text-white">
                  Ready to Advance Your Career?
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join thousands of tech professionals who have found their
                  dream jobs
                </p>
                <Link
                  to="/auth/register"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
