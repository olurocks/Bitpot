import { NextResponse } from "next/server";
import {
  fulfillDraw,
  publicClient,
} from "@/lib/keeper";

import { prizePoolAbi } from "@/abi/PrizePool";
import { Addresses } from "@/config/contracts";

export async function POST() {
  try {

    const pending =
      await publicClient.readContract({
        address: Addresses.prizePool,
        abi: prizePoolAbi,
        functionName:"drawPending"
      });

    if (!pending) {
      return NextResponse.json({
        success:false,
        reason:"no pending draw"
      });
    }

    const tx = await fulfillDraw();

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