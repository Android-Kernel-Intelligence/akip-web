/**
 * plugins.ts
 * Preconfigured kernel plugins available in the AKIP build system.
 */

export interface KernelPlugin {
  id: string;
  name: string;
  description: string;
  path: string;
  recommended: boolean;
  category: "root" | "security" | "performance" | "network";
}

export const AVAILABLE_PLUGINS: KernelPlugin[] = [
  {
    id: "kernelsu",
    name: "KernelSU",
    description: "A kernel-based root solution for Android GKI devices. Safe, fast, and runs in kernel mode.",
    path: "plugins/root/kernelsu",
    recommended: true,
    category: "root"
  },
  {
    id: "susfs",
    name: "SUSFS (Simple User Space File System)",
    description: "Anti-detection kernel patches that work with KernelSU to hide modified filesystem states.",
    path: "plugins/security/susfs",
    recommended: true,
    category: "security"
  },
  {
    id: "bbr",
    name: "BBR TCP Congestion Control",
    description: "Google's BBR congestion control algorithm to improve network throughput and latency.",
    path: "plugins/network/bbr",
    recommended: false,
    category: "network"
  },
  {
    id: "lmkd",
    name: "Low Memory Killer Daemon",
    description: "Custom kernel memory pressure level notification hooks for aggressive background management.",
    path: "plugins/performance/lmkd",
    recommended: false,
    category: "performance"
  },
  {
    id: "wireguard",
    name: "WireGuard VPN Support",
    description: "In-kernel WireGuard implementation for high-speed, secure, and energy-efficient tunneling.",
    path: "plugins/network/wireguard",
    recommended: false,
    category: "network"
  }
];
