import useVoyageController from '@hooks/useVoyageController';
import Button from '@components/Button';
import { ChangeEvent, useEffect, useState } from 'react';
import { Input } from '@mantine/core';
import {
  CHAIN_NAMESPACES,
  CustomChainConfig,
  WALLET_ADAPTERS,
} from '@web3auth/base';
import { Web3AuthCore } from '@web3auth/core';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import TorusDirectSdk from '@toruslabs/customauth';
import { importX509, jwtVerify } from 'jose';

export const CHAIN_CONFIG = {
  mainnet: {
    displayName: 'Ethereum Mainnet',
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x1',
    rpcTarget: `https://mainnet.infura.io/v3/776218ac4734478c90191dde8cae483c`,
    blockExplorer: 'https://etherscan.io/',
    ticker: 'ETH',
    tickerName: 'Ethereum',
  } as CustomChainConfig,
} as const;

export type CHAIN_CONFIG_TYPE = keyof typeof CHAIN_CONFIG;

const Login = () => {
  const controller = useVoyageController();
  const [isPendingOTP, setIsPendingOTP] = useState(false);
  const [otp, setOtp] = useState<string>();
  const [web3Auth, setWeb3Auth] = useState<Web3AuthCore>();
  const [torus, setTorus] = useState<TorusDirectSdk>();
  const currentChainConfig = CHAIN_CONFIG['mainnet'];
  useEffect(() => {
    async function init() {
      try {
        // get your client id from https://dashboard.web3auth.io by registering a plug and play application.
        const clientId = 'DzmlVbHqcvCOX9igHxaBI0cNqsF4pa0o';
        const web3AuthInstance = new Web3AuthCore({
          chainConfig: currentChainConfig,
        });
        // subscribeAuthEvents(web3AuthInstance);
        const adapter = new OpenloginAdapter({
          adapterSettings: {
            network: 'testnet',
            // this is the torus clientId
            clientId:
              'BDK2U8pm2MUgfDlx2dufjuUl2YuyNMPfrPG1ehwvqC9KAqt1dmZajsiIVCRW1nQiu9zHr7MKXNQ0V9sTMpkUnzM',
            uxMode: 'popup',
            loginConfig: {
              jwt: {
                name: 'Custom Firebase Login',
                verifier: 'voyage-auth0_other-testnet',
                typeOfLogin: 'jwt',
                // this is the Auth0 clientId
                clientId: 'DzmlVbHqcvCOX9igHxaBI0cNqsF4pa0o',
              },
            },
          },
        });
        web3AuthInstance.configureAdapter(adapter);
        await web3AuthInstance.init();
        setWeb3Auth(web3AuthInstance);
      } catch (error) {
        console.error(error);
      } finally {
        // setIsLoading(false);
      }
    }
    init();
  }, []);
  console.log('otp: ', otp);

  const generateKeys = async (token: string) => {
    // const res = await torus?.triggerLogin({
    //   typeOfLogin: 'jwt',
    //   verifier: 'voyage-auth0-testnet',
    //   clientId: 'DzmlVbHqcvCOX9igHxaBI0cNqsF4pa0o',
    // });
    const res = await web3Auth?.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      relogin: true,
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: token,
        domain: 'https://dev-tqbcqe09.us.auth0.com',
        verifierIdField: 'sub',
      },
    });
    console.log('logged in: ', res);
  };

  const login = async () => {
    const res = await web3Auth?.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      relogin: true,
      loginProvider: 'jwt',
      extraLoginOptions: {
        domain: 'https://dev-tqbcqe09.us.auth0.com',
        verifierIdField: 'sub',
      },
    });
  };

  const logout = async () => {
    const res = await web3Auth?.logout();
    console.log('loged out: ', res);
  };
  const startLogin = async () => {
    await controller.startLogin('ian.tan@voyage.finance');
    console.log('login succeeded');
    setIsPendingOTP(true);
  };
  // window.localStorage.setItem('test_key', 'test_val');
  console.log(window.localStorage.getItem('test_key'));
  const completeLogin = async () => {
    const res = await controller.completeLogin(otp!);
    console.log('got token from auth0', res);
    const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJSEnLoorx458mMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi10cWJjcWUwOS51cy5hdXRoMC5jb20wHhcNMjIwNzIyMDY0NDE0WhcN
MzYwMzMwMDY0NDE0WjAkMSIwIAYDVQQDExlkZXYtdHFiY3FlMDkudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtz0i+5V3gycF64oT
9HhKuK8Ubgwu/mSnzdHB7dGaQCrCKYU2jbmUVO14bNtW4LkW364kwMxVHEXfHBo7
hen4tTbJ+JM/yAfVMfpJJGY8ed0tnDIgK75bnAlRG8Mlj+tI4wkA3jMyoHUkFYyN
RPhQSQGf0YDcqcTQBNTvphr5CQMmRgnXKo042tJp/ca9Tv8DYfjv0J02k9MqXxj3
0Jj/vMR81x3scRYUR0TmKqpv17oNjvFjHNMgB0rQrsr9SdEsACJlidaHAmm2NZHW
wzlj9sLYDFOkd3elCy8FOaA5QO7g+lqI4KAnNUH4+1BdO7u9/m891AUlNbFUTwfC
pr0/xQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSHEcfyvu+S
BNYfsERV0yRB4osFizAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AE/YUuVb3PjbCE5zQHlbFU82NWoaH6quuhODhOdnVXTCm5NBNUWcwy4E97we6Zz2
fwyTDo1NFi4Fs/og9lrvYobGkwKaMH8eDaYYnErwyFWwz+9PpNSmu6/12+8oNOey
sVd3bPHA8taED6IV/S1adNW1BOdfX7f9quZcBel350KbGlX2yio66VG+z6I1Oj4h
VBMoNsX6qMzh8mgXY1jZ6GulltTHtBDBmgRgQdfgBefHWBEVR5eM3qZtq1orGEYI
BVILMjciu4KkyGMcjfjY85WWum8DMG9EWVST0vhiH/a43pxy4Q/bL48fPv3Md3eL
oqe+Fp9fUcRJPbhNSgrdbM4=
-----END CERTIFICATE-----`;
    const pubKey = await importX509(cert, 'RS256');
    const claims = await jwtVerify(res.id_token, pubKey);
    console.log('claims: ', claims);
    const jwt = await generateKeys(res.id_token);
  };

  return (
    <div>
      <Button onClick={login}>Login Directly</Button>
      <Button onClick={logout}>Logout Directly</Button>
      {!isPendingOTP ? (
        <Button onClick={startLogin}>Login</Button>
      ) : (
        <div>
          <Input
            onChange={(otp: ChangeEvent<HTMLInputElement>) =>
              setOtp(otp.target.value)
            }
          />
          <Button onClick={completeLogin}>Confirm</Button>
        </div>
      )}
    </div>
  );
};

export default Login;
