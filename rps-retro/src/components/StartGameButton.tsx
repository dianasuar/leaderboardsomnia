'use client';

import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';

export default function StartGameButton({
  target = 'https://xyz.com',        // <- yaha apna game URL
  className = '',
}: {
  target?: string;
  className?: string;
}) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  const handleClick = () => {
    if (!isConnected) {
      // Not connected: open RainbowKit connect modal
      openConnectModal?.();
      return;
    }
    // Connected: redirect
    // Option A: same tab
    router.push(target);
    // Option B (alternative): new tab
    // window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className={className || 'px-4 py-2 rounded-md bg-[#111] text-white hover:opacity-90'}
    >
      Start Game
    </button>
  );
}
