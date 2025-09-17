'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { formatEther } from 'viem';

const PFP_ADDR = (process.env.NEXT_PUBLIC_PFP_NFT_ADDRESS ?? '') as `0x${string}`;
const PFP_PRICE_WEI = BigInt(process.env.NEXT_PUBLIC_PFP_PRICE_WEI ?? '0'); // in wei

type Props = {
  open: boolean;
  onClose: () => void;
  images: string[];         // slider images
};

export default function PfpMintModal({ open, onClose, images }: Props) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();

  const [idx, setIdx] = useState(0);

  // basic auto-slide
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 2200);
    return () => clearInterval(t);
  }, [open, images.length]);

  // Simple ERC721/721A payable mint ABI (mint(uint256 quantity))
  const abi = useMemo(
    () => [
      {
        inputs: [{ name: 'quantity', type: 'uint256' }],
        name: 'mint',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ] as const,
    []
  );

  const mintOne = async () => {
    if (!isConnected || !address) return;
    if (!PFP_ADDR) {
      alert('PFP contract address missing. Set NEXT_PUBLIC_PFP_NFT_ADDRESS.');
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: PFP_ADDR,
        abi,
        functionName: 'mint',
        args: [1n],            // mint 1
        value: PFP_PRICE_WEI,  // pay price if required
      });

      // Wait for confirmation
      await publicClient?.waitForTransactionReceipt({ hash });
      alert('Mint successful! 🎉');
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e?.shortMessage || e?.message || 'Mint failed');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[4000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative w-[92vw] max-w-[520px] border-2 border-[#00ff00] bg-[#0a0a1a] shadow-[0_0_30px_#00ff00] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg mb-4 text-[#00ff00]">Mint PFP</h3>

        {/* slider */}
        <div className="relative w-full aspect-square overflow-hidden mb-4">
          <Image
            src={images[idx]}
            alt="PFP"
            fill
            sizes="520px"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <div className="flex items-center justify-between mb-3 text-[#00ff00] text-xs">
          <span>Selected #{idx + 1}</span>
          <span>
  Price: {Number(formatEther(PFP_PRICE_WEI)).toLocaleString(undefined, { maximumFractionDigits: 6 })} STT
</span>

        </div>

        <div className="flex gap-3">
          <button
            className="neon-btn flex-1"
            onClick={mintOne}
            disabled={isPending}
          >
            {isPending ? 'MINTING...' : 'MINT'}
          </button>
          <button className="neon-btn flex-1" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}