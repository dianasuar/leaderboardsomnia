"use client";
import LoadingOverlay from "../components/LoadingOverlay";
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  Theme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// ⬇️ use our custom Somnia chain (no other changes)
import { somnia } from '../lib/somnia';

// WalletConnect projectId from env (no functional change if you set same value)
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '';

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId,              // was hardcoded, now env-driven
  chains: [somnia],       // using your custom Somnia chain
  ssr: true,
});

import "./globals.css";
import { HoleBackground } from '../components/animate-ui/backgrounds/hole';

const myCustomTheme: Theme = {
  blurs: {
    modalOverlay: 'blur(0px)'
  },
  colors: {
    accentColor: '#00ff00',
    accentColorForeground: '#000000',
    actionButtonBorder: '#00ff00',
    actionButtonBorderMobile: '#00ff00',
    actionButtonSecondaryBackground: 'transparent',
    closeButton: '#00ff00',
    closeButtonBackground: 'transparent',
    connectButtonBackground: 'transparent',
    connectButtonBackgroundError: '#ff0000',
    connectButtonInnerBackground: 'transparent',
    connectButtonText: '#ffffffff',
    connectButtonTextError: '#ffffff',
    connectionIndicator: '#00ff00',
    downloadBottomCardBackground: '#000000',
    downloadTopCardBackground: '#000000', 
    error: '#ff0000',
    generalBorder: '#00ff00',
    generalBorderDim: 'rgba(0, 255, 0, 0.2)',
    menuItemBackground: '#000000',
    modalBackdrop: 'rgba(0, 0, 0, 0.8)',
    modalBackground: '#000000',
    modalBorder: '#00ff00',
    modalText: '#00ff00',
    modalTextDim: 'rgba(252, 255, 252, 0.7)',
    modalTextSecondary: '#b9ffb9ff',
    profileAction: '#000000ff',
    profileActionHover: '#ffffff',
    profileForeground: '#000000',
    selectedOptionBorder: '#00ff00',
    standby: '#00ff00'
  },
  fonts: {
    body: "'Press Start 2P', cursive"
  },
  radii: {
    actionButton: '0px',
    connectButton: '0px',
    menuButton: '0px',
    modal: '0px',
    modalMobile: '0px'
  },
  shadows: {
    connectButton: '0 0 10px rgba(0, 255, 0, 0.2)',
    dialog: '0 0 10px rgba(0, 255, 0, 0.2)',
    profileDetailsAction: '0 0 10px rgba(0, 255, 0, 0.2)',
    selectedOption: '0 0 10px rgba(0, 255, 0, 0.2)',
    selectedWallet: '0 0 10px rgba(0, 255, 0, 0.2)',
    walletLogo: '0 0 10px rgba(0, 255, 0, 0.2)'
  }
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
<body className="relative isolate"> 
  <LoadingOverlay /> 
  {/* bg lives in z-0, content above in z-10; isolate => clean stacking context */}
  <div className="pointer-events-none fixed inset-0 z-0">
    <HoleBackground />
  </div>

  <div id="app-content" className="relative z-10">
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={myCustomTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </div>
</body>


    </html>
  );
}
