import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

interface PairingSuccessAnimationProps {
  message?: string;
}

export const PairingSuccessAnimation = ({ message = "Pairing Successful!" }: PairingSuccessAnimationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
          className="relative flex items-center justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-32 h-32 rounded-full bg-primary/20" />
          </motion.div>
          
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10 w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center"
          >
            <CheckCircle2 className="w-16 h-16 text-primary" />
          </motion.div>
          
          {/* Sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI) / 3) * 80,
                y: Math.sin((i * Math.PI) / 3) * 80,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="absolute"
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-8 text-2xl font-bold text-center text-foreground"
        >
          {message}
        </motion.p>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-2 text-sm text-center text-muted-foreground"
        >
          Connection established successfully
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
