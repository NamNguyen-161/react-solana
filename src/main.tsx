import React, { useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  Coin98WalletAdapter,
  PhantomWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import configs from 'configs'
import { BrowserRouter } from 'react-router-dom'
import View from 'view'

const {
  rpc: { endpoint },
} = configs

export default function Main() {
  const wallets = useMemo(() => {
    const listWallets = [new PhantomWalletAdapter(), new Coin98WalletAdapter()]
    return listWallets
  }, [])
  return (
    <BrowserRouter>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <View />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  )
}
