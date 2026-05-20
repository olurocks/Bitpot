import { NextResponse } from "next/server";
import {
  requestDraw,
  publicClient,
} from "@/lib/keeper";

import { prizePoolAbi } from "@/abi/PrizePool";
import { Addresses } from "@/config/contracts";

export async function POST() {
  try {
    const [nextDrawTime, drawPending] =
      await Promise.all([
        publicClient.readContract({
          address: Addresses.prizePool,
          abi: prizePoolAbi,
          functionName: "nextDrawTime",
        }),

        publicClient.readContract({
          address: Addresses.prizePool,
          abi: prizePoolAbi,
          functionName: "drawPending",
        }),
      ]);

    const now = Math.floor(Date.now()/1000);

    if (drawPending) {
      return NextResponse.json({
        success:false,
        reason:"already pending"
      });
    }

    if (now < Number(nextDrawTime)) {
      return NextResponse.json({
        success:false,
        reason:"too early"
      });
    }

    const tx = await requestDraw();

    return NextResponse.json({
      success:true,
      tx
    });

  } catch(err) {
    return NextResponse.json(
      {
        success:false,
        error:String(err)
      },
      {status:500}
    );
  }
}