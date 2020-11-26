export const message_txh = {
    "action": "finishHand",
    "params": {
        "user_id": 692,
        "is_bot": false,
        "buy_in": 35120,
        "bet_amount": 1000,
        "win_amount": 1300,
        "fee_rate": 0.05,
        "hand_result": "win",
        "card_have": "Ts,2d,Ac,Jh,4s,Qs,2c",
        "card_rank": "1191627,1,2c,2d,Ac,Qs,Jh,Ts,4s",
        "end_state": "SHOWDOWN",
        "room_info": "200,400,0",
        "room_type": "cash",
        "game_type": "txh", // get code
        "state_logs": {
            "NONE": [
                {
                    "act": "BIG_BLIND",
                    "amount": 400
                }
            ],
            "PRE_FLOP": [
                {
                    "act": "CHECK",
                    "amount": 0
                }
            ],
            "FLOP": [
                {
                    "act": "CHECK",
                    "amount": 0
                }
            ],
            "TURN": [
                {
                    "act": "CHECK",
                    "amount": 0
                }
            ],
            "RIVER": [
                {
                    "act": "CHECK",
                    "amount": 0
                }
            ]
        },
        "pot_logs": [
            {
                "winAmount": 0,
                "betAmount": 400
            }
        ]
    }
};

export const message_cpk = {
    "action": "chineseFinishHand",
    "params": {
        "roomId": 197,
        "feeRate": 0.05,
        "roomType": "cash",
        "gameType": "cpk",
        "unitAmount": 200,
        "minPlayerBalance": 20000,
        "playerLogs": [
            {
                "profileId": 692,
                "seatNo": 1,
                "isBot": false,
                "unitWin": 0,
                "aceCount": 2,
                "winAmount": 200,
                "feeAmount": 10,
                "loseAmount": 0,
                "isMisSet": false,
                "royalty": "Non", // Total Natural Royalties
                "cards": [
                    "Qs",
                    "Jh",
                    "Td",
                    "Ad",
                    "As",
                    "8h",
                    "5s",
                    "4d",
                    "Kc",
                    "Kd",
                    "Kh",
                    "2c",
                    "2d"
                ],
                "settings": [
                    {
                        "settingType": "Back",
                        "settingRoyalty": "Non", // Total setting Royalties
                        "handCards": [
                            "Kc",
                            "Kd",
                            "Kh",
                            "2c",
                            "2d"
                        ],
                        "handType": 8,
                        "handCode": "full_house"
                    },
                    {
                        "settingType": "Front",
                        "settingRoyalty": "None",
                        "handCards": [
                            "Qs",
                            "Jh",
                            "Td"
                        ],
                        "handType": 0,
                        "handCode": "high_card"
                    },
                    {
                        "settingType": "Middle",
                        "settingRoyalty": "None",
                        "handCards": [
                            "Ad",
                            "As",
                            "8h",
                            "5s",
                            "4d"
                        ],
                        "handType": 1,
                        "handCode": "one_pair"
                    }
                ]
            }
        ]
    }
}

export const message_bjk = {
    "action": "blackjackFinishHand",
    "params": {
        "roomId": 202,
        "gameNo": 7533863,
        "gameType": "bjk",
        "roomType": "cash",
        "minBet": 400,
        "maxBet": 2000,
        "minDealerBalance": 24000,
        "minPlayerBalance": 2000,
        "maxPlayer": 4,
        "playerLogs": [
            {
                "profileId": 692,
                "seatNo": 2,
                "isBot": false,
                "totalBetAmount": 1326,
                "insuranceAmount": 0,
                "surrenderAmount": 0,
                "feeInsuranceAmount": 0,
                "winInsuranceAmount": 0,
                "loseInsuranceAmount": 0,
                "isInsurance": false,
                "isSurrender": false,
                "isDealer": false,
                "isSplit": false,
                "splitLogs": [
                    {
                        "splitId": 0,
                        "point": 20,
                        "profileId": 692,
                        "betAmount": 1326,
                        "feeAmount": 0,
                        "winAmount": 1326,
                        "loseAmount": 0,
                        "isBusted": false,
                        "isDouble": false,
                        "isBlackjack": false,
                        "acts": [
                            "STAND"
                        ],
                        "cards": [
                            "Ad",
                            "9d"
                        ]
                    }
                ]
            }
        ]
    }
}

export const message_tour_phk = {
    "action": "finishTour",
    "params": {
        "user_id": 692,
        "is_bot": false,
        "rank": 1,
        "reward": 0,
        "tour_info": {
            "id": 1,
            "name": "TOKYO",
            "fee": 50000,
            "buy_in": 50000,
            "tour_type": "sitngo",
            "game_type": "sng_phk"
        }
    }
}

export const message_tour_txh = {
    "action": "finishTour",
    "params": {
        "user_id": 692,
        "is_bot": true,
        "rank": 1,
        "reward": 237500,
        "tour_info": {
            "id": 23,
            "name": "TOKYO",
            "fee": 50000,
            "buy_in": 50000,
            "tour_type": "sitngo",
            "game_type": "sng_txh"
        }
    }
}