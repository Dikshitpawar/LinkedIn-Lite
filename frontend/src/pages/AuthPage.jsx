import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Users, MessageCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import "./AuthPage.css";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(6, "Minimum 6 characters required"),
});

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Full name is required"),
});

const FEATURES = [
  {
    Icon: Zap,
    title: "Real-time feed",
    desc: "See what your network is building",
  },
  {
    Icon: Users,
    title: "Smart connections",
    desc: "Discover people who matter to you",
  },
  {
    Icon: MessageCircle,
    title: "Engage instantly",
    desc: "Like, comment, and grow together",
  },
];

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register: registerUser } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setServerErr("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(data.email, data.password);
        show("Welcome back!", "success");
      } else {
        await registerUser(data.name.trim(), data.email, data.password);
        show("Account created — welcome to NetLink", "success");
      }
      navigate("/");
    } catch (err) {
      setServerErr(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth" data-theme="light">
      <div className="auth__brand-panel">
        <Link to="/" className="auth__logo">
          <div className="navbar__logo-container">
            <svg
              width="34"
              height="34"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="netlink-grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#0a66c2" />
                  <stop offset="100%" stopColor="#004182" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#netlink-grad)" />
              <path
                d="M9 23V14C9 11.2386 11.2386 9 14 9C16.7614 9 19 11.2386 19 14V23"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M19 15C19 12.2386 21.2386 10 24 10"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="19" cy="14" r="2" fill="#004182" />
            </svg>
          </div>
          <span>NetLink</span>
        </Link>

        <div className="auth__hero anim-fadeUp">
          <h1 className="auth__headline">
            Build your network.
            <br />
            <span className="auth__headline-accent">Share your story.</span>
          </h1>
          <p className="auth__tagline">
            NetLink is the professional network for builders, creators, and
            visionaries — where ideas meet opportunity.
          </p>
        </div>

        <div className="auth__features">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`auth__feature anim-fadeUp stagger-${i + 2}`}
            >
              <div className="auth__feature-icon">
                <f.Icon size={19} strokeWidth={1.75} />
              </div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth__form-panel">
        <div className="auth__card anim-scaleIn">
          <div className="auth__card-head">
            <h2>{isLogin ? "Sign in to NetLink" : "Join NetLink today"}</h2>
            <p>
              {isLogin
                ? "Pick up right where you left off"
                : "Create your account — it only takes a minute"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="auth__form"
            noValidate
          >
            {!isLogin && (
              <Input
                label="Full Name"
                placeholder="e.g. Maya Chen"
                error={errors.name?.message}
                autoFocus
                {...register("name")}
              />
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              autoFocus={isLogin}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder={isLogin ? "••••••••" : "At least 6 characters"}
              error={errors.password?.message}
              {...register("password")}
            />

            {serverErr && (
              <div className="auth__server-error">
                <AlertCircle size={16} />
                {serverErr}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="auth__switch">
            {isLogin ? (
              <>
                New to NetLink? <Link to="/register">Create an account</Link>
              </>
            ) : (
              <>
                Already have an account? <Link to="/login">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
