import * as cyfs from 'cyfs-sdk';

// cyfs.config.json -> app_id
export const DEC_ID_BASE58 = '9tGpLNnXzxMUXBZtNmzdschqc4R6CUjASUWtcCuBPNN2';

export const DEC_ID = cyfs.ObjectId.from_base_58(DEC_ID_BASE58).unwrap();

// cyfs.config.json -> app_name
export const APP_NAME = 'message-board-demo';

/**
 * zone1's peopleId and zone2's peopleId
 * If here is the mac simulator environment, ~/Library/Application Support/cyfs/etc/zone-simulator/desc_list
 * If here is the windows simulator environment, C:\cyfs\etc\zone-simulator\desc_list
 * Particularly, when you publish dec app to ood, you should use real poepleIds
 */
export const PEOPLE_IDS = [
    '5r4MYfFSMRLXSmzno9Ybh8s9MqoV2SEFJi4PbPWjHxNy',
    '5r4MYfF84DCMk7M8FzcTpSf4URxs5ihZbvgxyEcRv8QE'
];
