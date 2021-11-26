import React, { createContext, useContext, useEffect, useState } from "react";
import { useInjectedProvider } from "./injectedProviderContext";
import daiAbi from "../resources/contracts/DaiToken.json";
import spcAbi from "../resources/contracts/SinglePlayerCommit.json";
import { Contract, ethers } from "ethers";

type ContractContextType = {
  spcContract: Partial<Contract>;
  daiContract: Partial<Contract>;
  setSpcContract: (contract: Partial<Contract>) => void;
  setDaiContract: (contract: Partial<Contract>) => void;
};

export const ContractContext = createContext<ContractContextType>({
  spcContract: {},
  daiContract: {},
  setSpcContract: (contract: Partial<Contract>) => {},
  setDaiContract: (contract: Partial<Contract>) => {},
});

interface ContractProps {
  children: any;
}

const spcAddrs: any = {
  matic: "0x91E17f2A995f7EB830057a2F83ADa3A50a37F20d",
  mumbai: "0x6B6FD55b224b25B2F56A10Ce670B097e66Fca136",
};

const daiAddrs: any = {
  matic: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  mumbai: "0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB",
};

export const ContractContextProvider: React.FC<ContractProps> = ({
  children,
}: ContractProps) => {
  const [spcContract, setSpcContract] = useState<Partial<Contract>>({});
  const [daiContract, setDaiContract] = useState<Partial<Contract>>({});

  const { injectedChain, injectedProvider, address } = useInjectedProvider();

  useEffect(() => {

    const initContract = async () => {
      try {
        let _daiContract  = new ethers.Contract(
          daiAddrs[injectedChain.network],
          daiAbi,
          injectedProvider 
        );

        let _spcContract = new ethers.Contract(
          spcAddrs[injectedChain.network],
          spcAbi,
          injectedProvider
        );

        if(injectedProvider.getSigner() && address){
          _daiContract = _daiContract.connect(injectedProvider.getSigner(address))
          _spcContract = _spcContract.connect(injectedProvider.getSigner(address))
        }

        console.log("Setting DAI contract: ", _daiContract);
        console.log("Setting SPC contract: ", _spcContract);

        setDaiContract(_daiContract);
        setSpcContract(_spcContract);
      } catch (e) {
        console.error(`Could not init contract`);
      }
    };

    if (injectedProvider && injectedChain?.network) {
      initContract();
    }
  }, [injectedProvider, injectedChain]);

  return (
    <ContractContext.Provider
      value={{ daiContract, spcContract, setSpcContract, setDaiContract }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => {
  const { spcContract, daiContract } = useContext(ContractContext);
  return { spcContract, daiContract };
};
