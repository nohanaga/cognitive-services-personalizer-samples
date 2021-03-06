﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

using Microsoft.Azure.CognitiveServices.Personalizer.Models;
using ChatbotSample.Model;
using System;
using System.Collections.Generic;

namespace ChatbotSample.ReinforcementLearning
{
    /// <summary>
    /// Manages reinforcement learning features and tracks current event ID used in this demo.
    /// </summary>
    public class RLContextManager
    {
        /// <summary>
        /// Gets RLFeatures used in Rank.
        /// </summary>
        /// <value>
        /// <see cref="RLFeatures"/>.
        /// </value>
        public RLFeatures RLFeatures { get; private set; }

        /// <summary>
        /// Gets event Id used in Rank and Reward Call.
        /// </summary>
        /// <value>
        /// UUId string.
        /// </value>
        public string CurrentEventId { get; private set; }

        /// <summary>
        /// Gets or sets current user preference from last Rank call.
        /// </summary>
        /// <value>
        /// An array of <see cref="RankedAction"/>.
        /// </value>
        public IList<RankedAction> CurrentPreference { get; set; }

        public RLContextManager()
        {
            GenerateRLFeatures();
        }

        public void GenerateRLFeatures()
        {
            var index = new Random().Next(0, 3);
            Weather weather = (Weather)Enum.GetValues(typeof(Weather)).GetValue(index);
            DayOfWeek daysOfWeek = (DayOfWeek)Enum.GetValues(typeof(DayOfWeek)).GetValue(new Random().Next(0, 7));
            RLFeatures = new RLFeatures(weather, daysOfWeek);
            CurrentPreference = null;
            CurrentEventId = null;
        }

        public string GenerateEventId()
        {
            CurrentEventId = Guid.NewGuid().ToString();
            return CurrentEventId;
        }
    }
}
