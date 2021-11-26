

export interface Commitment {
  activityKey: string;
  exists: boolean;
  met: boolean;
  goalValue: number;
  startTime: number;
  endTime: number;
  reportedValue: number;
  stake: string;
  unit: string;
  activitySet?: boolean;
  activityName?: string;
  stakeSet?: boolean;
  progress?: number;
}

export interface Athlete {
  id: number;
  username?: string;
  firstname?: string;
  profile_medium?: string;
}

export interface Activity {
  key: string;
  name: string;
  oracle: string;
  allowed: boolean;
  exists: boolean;
}

export interface DropdownItem {
  label: string;
  value: string;
}

export interface Network {
  name: string;
  short_name: string;
  chain: string;
  network: string;
  network_id: number;
  chain_id: string;
  providers: string[];
  rpc_url: string;
  block_explorer: string;
  hub_sort_order?: number;
  spcAddress: string;
  daiAddress: string;
  linkAddress: string;
}

export type TransactionTypes =
  | "approve"
  | "depositAndCommit"
  | "requestActivityDistance"
  | "processCommitmentUser"
  | undefined;

export type TransactionDetails = {
  methodCall: Partial<TransactionTypes>;
  tx: Partial<Transaction>;
  pending: boolean;
};

export type User = {
  type: string;
  attributes: {
    "custom:account_address": string;
    [key: string]: string;
  };
  network: Network;
  username: string;
  nativeTokenBalance: string;
  daiBalance: string;
  daiAllowance: string;
};
