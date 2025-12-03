import React, { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, BarChart3, ArrowRight, RefreshCw, Heart, Zap } from 'lucide-react';

// ============================================
// OUTCOME MODE: Choose-Your-Own-Adventure
// ============================================
// User choices influence outcomes, creating branching paths
// TD learning tracks confidence changes in real-time

function OutcomeMode({ setSelectedMode }) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [phase, setPhase] = useState('landing'); // 'landing' | 'playing' | 'finished'
  const [currentValue, setCurrentValue] = useState(5); // Confidence value (0-10)
  const [valueHistory, setValueHistory] = useState([5]);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [outcomeHistory, setOutcomeHistory] = useState([]);
  const [rpeHistory, setRpeHistory] = useState([]);
  
  // Learning rates (estimated from behavior)
  const [positiveLearningRate, setPositiveLearningRate] = useState(0.5);
  const [negativeLearningRate, setNegativeLearningRate] = useState(0.5);
  
  // Current position in branching story
  const [currentNodeId, setCurrentNodeId] = useState('start');
  
  // ============================================
  // BRANCHING SCENARIO STRUCTURE
  // ============================================
  // Each node has: id, situation, choices (with nextNodeId), and outcomes based on choice
  
  const storyNodes = {
    start: {
      id: 'start',
      situation: "Monday morning at school. You arrive and see your friend group laughing together by the lockers. They haven't noticed you yet.",
      choices: [
        {
          id: 'a',
          text: "Walk over confidently and join them",
          confidenceLevel: 8,
          nextNodeId: 'joined_confidently'
        },
        {
          id: 'b',
          text: "Wave and see if they invite you over",
          confidenceLevel: 5,
          nextNodeId: 'waved'
        },
        {
          id: 'c',
          text: "Go to your locker alone, they seem busy",
          confidenceLevel: 2,
          nextNodeId: 'avoided'
        }
      ]
    },
    joined_confidently: {
      id: 'joined_confidently',
      situation: "You walk over with a smile. Sarah turns and sees you first.",
      choices: [
        {
          id: 'a',
          text: "Say 'Hey everyone! What's so funny?'",
          confidenceLevel: 8,
          nextNodeId: 'engaged_high'
        },
        {
          id: 'b',
          text: "Just smile and listen to the conversation",
          confidenceLevel: 6,
          nextNodeId: 'engaged_medium'
        }
      ],
      outcome: {
        reward: 7,
        description: "Sarah smiles warmly. 'Hey! I was hoping I'd see you! How was your weekend?'"
      }
    },
    waved: {
      id: 'waved',
      situation: "You wave from a distance. A couple friends notice and wave back.",
      choices: [
        {
          id: 'a',
          text: "Walk over now that they've acknowledged you",
          confidenceLevel: 6,
          nextNodeId: 'joined_after_wave'
        },
        {
          id: 'b',
          text: "Stay where you are and wait for them to come over",
          confidenceLevel: 4,
          nextNodeId: 'waited'
        }
      ],
      outcome: {
        reward: 5,
        description: "They wave back with friendly smiles. One friend calls out 'Come over!'"
      }
    },
    avoided: {
      id: 'avoided',
      situation: "You head to your locker alone. As you're getting your books, you notice your friends are still laughing together.",
      choices: [
        {
          id: 'a',
          text: "Go back and join them now",
          confidenceLevel: 5,
          nextNodeId: 'joined_late'
        },
        {
          id: 'b',
          text: "Head to class early",
          confidenceLevel: 3,
          nextNodeId: 'left_early'
        }
      ],
      outcome: {
        reward: 2,
        description: "You're at your locker alone. The laughter continues behind you."
      }
    },
    engaged_high: {
      id: 'engaged_high',
      situation: "You jump into the conversation enthusiastically. Everyone turns to include you.",
      choices: [
        {
          id: 'a',
          text: "Share a funny story from your weekend",
          confidenceLevel: 9,
          nextNodeId: 'shared_story'
        },
        {
          id: 'b',
          text: "Ask them what they're talking about",
          confidenceLevel: 7,
          nextNodeId: 'asked_question'
        }
      ],
      outcome: {
        reward: 8,
        description: "The group laughs at your story. 'That's hilarious! You should tell us more!'"
      }
    },
    engaged_medium: {
      id: 'engaged_medium',
      situation: "You're listening to the conversation. Someone mentions a party this weekend.",
      choices: [
        {
          id: 'a',
          text: "Express interest in going",
          confidenceLevel: 7,
          nextNodeId: 'interested_party'
        },
        {
          id: 'b',
          text: "Just nod and smile",
          confidenceLevel: 5,
          nextNodeId: 'passive_response'
        }
      ],
      outcome: {
        reward: 6,
        description: "They include you in the planning. 'You should come too!'"
      }
    },
    joined_after_wave: {
      id: 'joined_after_wave',
      situation: "You walk over and they make space for you in the circle.",
      choices: [
        {
          id: 'a',
          text: "Thank them and join the conversation",
          confidenceLevel: 7,
          nextNodeId: 'thankful_join'
        },
        {
          id: 'b',
          text: "Stand quietly and listen",
          confidenceLevel: 5,
          nextNodeId: 'quiet_listen'
        }
      ],
      outcome: {
        reward: 6,
        description: "They welcome you warmly. 'Glad you came over!'"
      }
    },
    waited: {
      id: 'waited',
      situation: "You wait, but they don't come over. The conversation continues without you.",
      choices: [
        {
          id: 'a',
          text: "Finally walk over yourself",
          confidenceLevel: 4,
          nextNodeId: 'joined_after_wait'
        },
        {
          id: 'b',
          text: "Head to class feeling left out",
          confidenceLevel: 2,
          nextNodeId: 'felt_left_out'
        }
      ],
      outcome: {
        reward: 1,
        description: "You're still standing alone. The bell is about to ring."
      }
    },
    joined_late: {
      id: 'joined_late',
      situation: "You walk back over. The conversation has moved on to a different topic.",
      choices: [
        {
          id: 'a',
          text: "Ask what you missed",
          confidenceLevel: 5,
          nextNodeId: 'caught_up'
        },
        {
          id: 'b',
          text: "Try to follow along silently",
          confidenceLevel: 3,
          nextNodeId: 'silent_follow'
        }
      ],
      outcome: {
        reward: 4,
        description: "They briefly explain, but the moment has passed. The bell rings."
      }
    },
    left_early: {
      id: 'left_early',
      situation: "You're in class early, sitting alone. Your friends arrive together, still laughing.",
      choices: [
        {
          id: 'a',
          text: "Wave them over to sit with you",
          confidenceLevel: 4,
          nextNodeId: 'invited_friends'
        },
        {
          id: 'b',
          text: "Stay in your seat, feeling isolated",
          confidenceLevel: 2,
          nextNodeId: 'isolated'
        }
      ],
      outcome: {
        reward: -2,
        description: "They sit together in a different row. You're alone in the front."
      }
    },
    shared_story: {
      id: 'shared_story',
      situation: "The group loves your story! They're asking you more questions.",
      choices: [
        {
          id: 'a',
          text: "Continue engaging enthusiastically",
          confidenceLevel: 9,
          nextNodeId: 'high_engagement'
        },
        {
          id: 'b',
          text: "Feel a bit overwhelmed and tone it down",
          confidenceLevel: 6,
          nextNodeId: 'moderate_engagement'
        }
      ],
      outcome: {
        reward: 9,
        description: "You're the center of attention in the best way. Everyone is engaged and laughing."
      }
    },
    asked_question: {
      id: 'asked_question',
      situation: "They explain the joke. You get it and laugh along.",
      choices: [
        {
          id: 'a',
          text: "Add your own comment to the joke",
          confidenceLevel: 7,
          nextNodeId: 'added_to_joke'
        },
        {
          id: 'b',
          text: "Just laugh and enjoy the moment",
          confidenceLevel: 6,
          nextNodeId: 'enjoyed_moment'
        }
      ],
      outcome: {
        reward: 7,
        description: "Your comment gets another laugh. The group feels cohesive and fun."
      }
    },
    interested_party: {
      id: 'interested_party',
      situation: "They're excited you want to come! They start making plans.",
      choices: [
        {
          id: 'a',
          text: "Offer to help organize",
          confidenceLevel: 8,
          nextNodeId: 'organizer'
        },
        {
          id: 'b',
          text: "Just confirm you'll be there",
          confidenceLevel: 6,
          nextNodeId: 'confirmed'
        }
      ],
      outcome: {
        reward: 8,
        description: "'Great! We'll text you the details. It's going to be so fun!'"
      }
    },
    passive_response: {
      id: 'passive_response',
      situation: "You nod along, but don't say much. The conversation continues.",
      choices: [
        {
          id: 'a',
          text: "Try to add something to the conversation",
          confidenceLevel: 5,
          nextNodeId: 'tried_to_engage'
        },
        {
          id: 'b',
          text: "Continue being quiet",
          confidenceLevel: 3,
          nextNodeId: 'stayed_quiet'
        }
      ],
      outcome: {
        reward: 4,
        description: "You're included but not really participating. The moment feels a bit awkward."
      }
    },
    thankful_join: {
      id: 'thankful_join',
      situation: "You express gratitude and jump into the conversation.",
      choices: [
        {
          id: 'a',
          text: "Share something about your weekend",
          confidenceLevel: 7,
          nextNodeId: 'shared_weekend'
        },
        {
          id: 'b',
          text: "Ask about their plans",
          confidenceLevel: 6,
          nextNodeId: 'asked_plans'
        }
      ],
      outcome: {
        reward: 7,
        description: "The conversation flows naturally. You feel included and valued."
      }
    },
    quiet_listen: {
      id: 'quiet_listen',
      situation: "You're standing there but not saying much. Someone notices.",
      choices: [
        {
          id: 'a',
          text: "When asked, share your thoughts",
          confidenceLevel: 6,
          nextNodeId: 'shared_when_asked'
        },
        {
          id: 'b',
          text: "Say 'nothing much' and stay quiet",
          confidenceLevel: 3,
          nextNodeId: 'stayed_quiet_2'
        }
      ],
      outcome: {
        reward: 5,
        description: "They try to include you, but you're not contributing much to the conversation."
      }
    },
    joined_after_wait: {
      id: 'joined_after_wait',
      situation: "You finally walk over. They notice you and make space.",
      choices: [
        {
          id: 'a',
          text: "Apologize for being late to join",
          confidenceLevel: 4,
          nextNodeId: 'apologized'
        },
        {
          id: 'b',
          text: "Just join naturally without explanation",
          confidenceLevel: 6,
          nextNodeId: 'natural_join'
        }
      ],
      outcome: {
        reward: 5,
        description: "They welcome you, but you feel like you missed the best part of the conversation."
      }
    },
    felt_left_out: {
      id: 'felt_left_out',
      situation: "You're walking to class alone, feeling excluded.",
      choices: [
        {
          id: 'a',
          text: "Try to catch up and walk with them",
          confidenceLevel: 3,
          nextNodeId: 'caught_up_walk'
        },
        {
          id: 'b',
          text: "Accept it and go to class alone",
          confidenceLevel: 2,
          nextNodeId: 'accepted_isolation'
        }
      ],
      outcome: {
        reward: -3,
        description: "You're in class now, sitting alone. The morning didn't go as you hoped."
      }
    },
    caught_up: {
      id: 'caught_up',
      situation: "They explain briefly, but the conversation momentum is gone.",
      choices: [
        {
          id: 'a',
          text: "Try to restart the conversation",
          confidenceLevel: 5,
          nextNodeId: 'restarted_convo'
        },
        {
          id: 'b',
          text: "Accept it and move on",
          confidenceLevel: 4,
          nextNodeId: 'moved_on'
        }
      ],
      outcome: {
        reward: 4,
        description: "The bell rings. You're together, but the connection feels weaker."
      }
    },
    silent_follow: {
      id: 'silent_follow',
      situation: "You're trying to follow along but feeling out of the loop.",
      choices: [
        {
          id: 'a',
          text: "Ask a clarifying question",
          confidenceLevel: 4,
          nextNodeId: 'asked_clarification'
        },
        {
          id: 'b',
          text: "Give up and wait for class",
          confidenceLevel: 2,
          nextNodeId: 'gave_up'
        }
      ],
      outcome: {
        reward: 2,
        description: "You're confused and disconnected. The moment feels awkward."
      }
    },
    invited_friends: {
      id: 'invited_friends',
      situation: "You wave them over. They look at you, then at each other.",
      choices: [
        {
          id: 'a',
          text: "Smile and gesture more enthusiastically",
          confidenceLevel: 5,
          nextNodeId: 'enthusiastic_invite'
        },
        {
          id: 'b',
          text: "Feel self-conscious and stop waving",
          confidenceLevel: 2,
          nextNodeId: 'stopped_inviting'
        }
      ],
      outcome: {
        reward: 3,
        description: "One friend comes over. 'Sorry, we didn't see you earlier.'"
      }
    },
    isolated: {
      id: 'isolated',
      situation: "You're sitting alone. Class is about to start.",
      choices: [
        {
          id: 'a',
          text: "Try to make eye contact and smile",
          confidenceLevel: 3,
          nextNodeId: 'tried_connection'
        },
        {
          id: 'b',
          text: "Focus on class and ignore the feeling",
          confidenceLevel: 2,
          nextNodeId: 'focused_class'
        }
      ],
      outcome: {
        reward: -4,
        description: "Class starts. You're alone, and the morning feels like a failure."
      }
    },
    // Terminal nodes (end of story branches)
    high_engagement: {
      id: 'high_engagement',
      situation: "The morning has been amazing! You feel confident and connected.",
      isTerminal: true,
      outcome: {
        reward: 10,
        description: "You've had a fantastic morning. Your confidence is high, and you feel truly part of the group."
      }
    },
    moderate_engagement: {
      id: 'moderate_engagement',
      situation: "The morning was good. You feel okay but maybe a bit tired.",
      isTerminal: true,
      outcome: {
        reward: 6,
        description: "It was a decent morning. You're included, but you feel like you could have engaged more."
      }
    },
    added_to_joke: {
      id: 'added_to_joke',
      situation: "You're feeling good! The group dynamic is positive.",
      isTerminal: true,
      outcome: {
        reward: 8,
        description: "Great morning! You contributed to the fun and feel valued by your friends."
      }
    },
    enjoyed_moment: {
      id: 'enjoyed_moment',
      situation: "You're content. The morning was pleasant.",
      isTerminal: true,
      outcome: {
        reward: 7,
        description: "A nice, comfortable morning with friends. Nothing spectacular, but solid."
      }
    },
    organizer: {
      id: 'organizer',
      situation: "You're excited about the party and feel included in planning!",
      isTerminal: true,
      outcome: {
        reward: 9,
        description: "You're helping organize! This feels great - you're an important part of the group."
      }
    },
    confirmed: {
      id: 'confirmed',
      situation: "You're going to the party! Feeling good about it.",
      isTerminal: true,
      outcome: {
        reward: 7,
        description: "You're included in the plans. Looking forward to the weekend!"
      }
    },
    tried_to_engage: {
      id: 'tried_to_engage',
      situation: "You made an effort. That counts for something.",
      isTerminal: true,
      outcome: {
        reward: 5,
        description: "You tried, but the conversation didn't quite click. Still, you made the effort."
      }
    },
    stayed_quiet: {
      id: 'stayed_quiet',
      situation: "The morning passed quietly. You were there but not really present.",
      isTerminal: true,
      outcome: {
        reward: 3,
        description: "You were physically present but emotionally distant. The morning felt empty."
      }
    },
    shared_weekend: {
      id: 'shared_weekend',
      situation: "You opened up and shared. That felt good.",
      isTerminal: true,
      outcome: {
        reward: 7,
        description: "Sharing felt vulnerable but rewarding. Your friends listened and responded warmly."
      }
    },
    asked_plans: {
      id: 'asked_plans',
      situation: "You showed interest in their lives. That's connection.",
      isTerminal: true,
      outcome: {
        reward: 6,
        description: "Good conversation! You're building connections by showing genuine interest."
      }
    },
    shared_when_asked: {
      id: 'shared_when_asked',
      situation: "You responded when invited. That's progress.",
      isTerminal: true,
      outcome: {
        reward: 5,
        description: "You shared when prompted. It was okay, but you wish you'd been more proactive."
      }
    },
    stayed_quiet_2: {
      id: 'stayed_quiet_2',
      situation: "You stayed quiet. The opportunity passed.",
      isTerminal: true,
      outcome: {
        reward: 3,
        description: "You didn't engage when given the chance. The moment feels like a missed opportunity."
      }
    },
    apologized: {
      id: 'apologized',
      situation: "You apologized, but maybe unnecessarily.",
      isTerminal: true,
      outcome: {
        reward: 4,
        description: "They say 'no worries' but you still feel like you did something wrong."
      }
    },
    natural_join: {
      id: 'natural_join',
      situation: "You joined naturally. That felt right.",
      isTerminal: true,
      outcome: {
        reward: 6,
        description: "You recovered well. The morning ended on a positive note."
      }
    },
    caught_up_walk: {
      id: 'caught_up_walk',
      situation: "You tried to reconnect. That took courage.",
      isTerminal: true,
      outcome: {
        reward: 2,
        description: "You caught up, but the connection feels strained. The morning was hard."
      }
    },
    accepted_isolation: {
      id: 'accepted_isolation',
      situation: "You accepted the isolation. That's heavy.",
      isTerminal: true,
      outcome: {
        reward: -5,
        description: "You're alone in class. The morning reinforced feelings of exclusion and loneliness."
      }
    },
    restarted_convo: {
      id: 'restarted_convo',
      situation: "You tried to restart. That's resilience.",
      isTerminal: true,
      outcome: {
        reward: 4,
        description: "You made an effort to reconnect. It's not perfect, but you're trying."
      }
    },
    moved_on: {
      id: 'moved_on',
      situation: "You moved on. Sometimes that's necessary.",
      isTerminal: true,
      outcome: {
        reward: 3,
        description: "You let it go. The morning was okay, nothing special."
      }
    },
    asked_clarification: {
      id: 'asked_clarification',
      situation: "You asked for help. That's brave.",
      isTerminal: true,
      outcome: {
        reward: 3,
        description: "They explain, but you still feel a bit out of the loop. The morning was confusing."
      }
    },
    gave_up: {
      id: 'gave_up',
      situation: "You gave up. That's hard.",
      isTerminal: true,
      outcome: {
        reward: -3,
        description: "You stopped trying. The morning feels like a series of missed connections."
      }
    },
    enthusiastic_invite: {
      id: 'enthusiastic_invite',
      situation: "You persisted. That matters.",
      isTerminal: true,
      outcome: {
        reward: 4,
        description: "One friend came over. It's not the whole group, but it's something."
      }
    },
    stopped_inviting: {
      id: 'stopped_inviting',
      situation: "You stopped trying. That's painful.",
      isTerminal: true,
      outcome: {
        reward: -4,
        description: "You gave up. Sitting alone, the morning feels like a complete failure."
      }
    },
    tried_connection: {
      id: 'tried_connection',
      situation: "You tried to connect. That's something.",
      isTerminal: true,
      outcome: {
        reward: 1,
        description: "You made eye contact, but nothing came of it. The morning was lonely."
      }
    },
    focused_class: {
      id: 'focused_class',
      situation: "You focused on class. Sometimes that's a coping mechanism.",
      isTerminal: true,
      outcome: {
        reward: -2,
        description: "You're in class, but the morning's isolation weighs on you."
      }
    }
  };

  // ============================================
  // TD LEARNING FUNCTIONS
  // ============================================

  const updateValueWithTD = (reward, currentVal) => {
    // Normalize reward to 0-10 scale (assuming reward is -10 to +10)
    const normalizedReward = 5 + (reward * 0.4);
    
    // Calculate Reward Prediction Error
    const rpe = normalizedReward - currentVal;
    
    // Select learning rate based on outcome sign
    const alpha = rpe > 0 ? positiveLearningRate : negativeLearningRate;
    
    // TD Update: V(t+1) = V(t) + α[r - V(t)]
    const newValue = currentVal + (alpha * rpe);
    
    // Clamp to 0-10 range
    return Math.max(0, Math.min(10, newValue));
  };

  const estimateLearningRates = () => {
    if (outcomeHistory.length < 2) {
      return { positiveLearningRate: 0.5, negativeLearningRate: 0.5 };
    }

    let positiveUpdates = [];
    let negativeUpdates = [];

    // Analyze how confidence changed after each outcome
    for (let i = 0; i < outcomeHistory.length - 1; i++) {
      const outcome = outcomeHistory[i];
      const currentConf = choiceHistory[i]?.confidenceLevel || 5;
      const nextConf = choiceHistory[i + 1]?.confidenceLevel || 5;
      
      const confidenceChange = nextConf - currentConf;
      
      if (outcome.reward > 0) {
        positiveUpdates.push({
          reward: outcome.reward,
          change: confidenceChange,
          impliedAlpha: Math.max(0, confidenceChange / outcome.reward)
        });
      } else if (outcome.reward < 0) {
        negativeUpdates.push({
          reward: outcome.reward,
          change: confidenceChange,
          impliedAlpha: Math.max(0, -confidenceChange / Math.abs(outcome.reward))
        });
      }
    }

    const avgPositiveAlpha = positiveUpdates.length > 0
      ? positiveUpdates.reduce((sum, u) => sum + u.impliedAlpha, 0) / positiveUpdates.length
      : 0.5;
      
    const avgNegativeAlpha = negativeUpdates.length > 0
      ? negativeUpdates.reduce((sum, u) => sum + u.impliedAlpha, 0) / negativeUpdates.length
      : 0.5;

    // Clamp to reasonable range
    const finalPositiveAlpha = Math.min(0.9, Math.max(0.1, avgPositiveAlpha * 0.8));
    const finalNegativeAlpha = Math.min(0.9, Math.max(0.1, avgNegativeAlpha * 0.8));

    return {
      positiveLearningRate: parseFloat(finalPositiveAlpha.toFixed(2)),
      negativeLearningRate: parseFloat(finalNegativeAlpha.toFixed(2))
    };
  };

  // ============================================
  // CHOICE HANDLING
  // ============================================

  const handleChoice = (choice) => {
    const node = storyNodes[currentNodeId];
    
    // Record choice
    const updatedChoiceHistory = [...choiceHistory, choice];
    setChoiceHistory(updatedChoiceHistory);
    
    // Track outcomes and values with functional updates to avoid stale state
    let updatedOutcomeHistory = [...outcomeHistory];
    let updatedValueHistory = [...valueHistory];
    let updatedCurrentValue = currentValue;
    
    // Get outcome (if this node has one)
    if (node.outcome) {
      updatedOutcomeHistory = [...updatedOutcomeHistory, node.outcome];
      
      // Update value using TD learning with current value
      updatedCurrentValue = updateValueWithTD(node.outcome.reward, updatedCurrentValue);
      updatedValueHistory = [...updatedValueHistory, updatedCurrentValue];
      
      // Calculate RPE for history
      const normalizedReward = 5 + (node.outcome.reward * 0.4);
      const rpe = normalizedReward - currentValue;
      const alpha = rpe > 0 ? positiveLearningRate : negativeLearningRate;
      setRpeHistory([...rpeHistory, { rpe, alpha, reward: node.outcome.reward }]);
      
      // Update state
      setOutcomeHistory(updatedOutcomeHistory);
      setCurrentValue(updatedCurrentValue);
      setValueHistory(updatedValueHistory);
      
      // Update learning rates based on behavior
      const estimated = estimateLearningRates();
      setPositiveLearningRate(estimated.positiveLearningRate);
      setNegativeLearningRate(estimated.negativeLearningRate);
    }
    
    // Move to next node
    if (choice.nextNodeId) {
      const nextNode = storyNodes[choice.nextNodeId];
      if (nextNode.isTerminal) {
        // Handle terminal node - add its outcome to the choice we just made
        if (nextNode.outcome) {
          // Add terminal outcome - this corresponds to the choice we just made
          const finalOutcomeHistory = [...updatedOutcomeHistory, nextNode.outcome];
          const finalValue = updateValueWithTD(nextNode.outcome.reward, updatedCurrentValue);
          const finalValueHistory = [...updatedValueHistory, finalValue];
          
          setOutcomeHistory(finalOutcomeHistory);
          setCurrentValue(finalValue);
          setValueHistory(finalValueHistory);
        }
        setPhase('finished');
      } else {
        setCurrentNodeId(choice.nextNodeId);
      }
    }
  };

  const resetGame = () => {
    setPhase('landing');
    setCurrentValue(5);
    setValueHistory([5]);
    setChoiceHistory([]);
    setOutcomeHistory([]);
    setRpeHistory([]);
    setPositiveLearningRate(0.5);
    setNegativeLearningRate(0.5);
    setCurrentNodeId('start');
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  if (phase === 'landing') {
    const avgConfidence = valueHistory.length > 0
      ? (valueHistory.reduce((a, b) => a + b, 0) / valueHistory.length).toFixed(1)
      : '5.0';
    
    const maxConfidence = valueHistory.length > 0 ? Math.max(...valueHistory).toFixed(1) : '5.0';
    const minConfidence = valueHistory.length > 0 ? Math.min(...valueHistory).toFixed(1) : '5.0';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-center mb-6">
              <Zap className="w-16 h-16 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
              Outcome Mode
            </h1>
            <p className="text-lg text-gray-600 text-center mb-8">
              Your choices shape the story. Experience how your decisions influence outcomes and track your confidence in real-time.
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-8 h-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">Your Stats</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Current Confidence</span>
                    <span className="font-bold text-indigo-600">{currentValue.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${(currentValue / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="text-xl font-bold text-gray-800">{avgConfidence}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Highest</p>
                    <p className="text-xl font-bold text-green-600">{maxConfidence}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lowest</p>
                    <p className="text-xl font-bold text-red-600">{minConfidence}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Learning Rates</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Positive Learning (α⁺)</span>
                    <span className="font-bold text-green-600">{positiveLearningRate.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    How much you learn from positive outcomes
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(positiveLearningRate / 0.9) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Negative Learning (α⁻)</span>
                    <span className="font-bold text-red-600">{negativeLearningRate.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    How much you learn from negative outcomes
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(negativeLearningRate / 0.9) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-gray-700">
                    <strong>Note:</strong> These rates are estimated from your choices. 
                    Higher α⁻ means negative experiences have a stronger impact on your confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence History Chart */}
          {valueHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confidence Over Time</h3>
              {valueHistory.length === 1 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Make choices to see your confidence change over time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Chart container with explicit height */}
                  <div 
                    className="relative border-b-2 border-l-2 border-gray-300 bg-gray-50"
                    style={{ height: '200px', paddingLeft: '32px' }}
                  >
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 px-1" style={{ width: '32px' }}>
                      <span>10</span>
                      <span>5</span>
                      <span>0</span>
                    </div>
                    {/* Bars container - using flex with explicit alignment */}
                    <div 
                      className="h-full flex items-end justify-start gap-1"
                      style={{ height: '200px', width: '100%' }}
                    >
                      {valueHistory.map((value, index) => {
                        // Calculate height as percentage of max (10)
                        const heightPercent = (value / 10) * 100;
                        // Ensure minimum visible height (at least 8px)
                        const barHeightPx = Math.max((heightPercent / 100) * 200, 8);
                        const barWidth = `${100 / valueHistory.length}%`;
                        return (
                          <div 
                            key={index} 
                            className="flex flex-col items-center justify-end group relative"
                            style={{ 
                              height: '100%',
                              width: barWidth,
                              minWidth: '20px'
                            }}
                          >
                            <div 
                              className="w-full bg-indigo-600 rounded-t transition-all hover:bg-indigo-700 cursor-pointer shadow-sm"
                              style={{ 
                                height: `${barHeightPx}px`,
                                minHeight: '8px'
                              }}
                              title={`Step ${index + 1}: ${value.toFixed(1)}/10`}
                            />
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              {value.toFixed(1)}/10
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* X-axis labels */}
                  <div className="flex gap-1" style={{ paddingLeft: '32px' }}>
                    {valueHistory.map((value, index) => (
                      <div key={index} className="text-center" style={{ width: `${100 / valueHistory.length}%` }}>
                        <span className="text-xs text-gray-500">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Journey Summary */}
          {choiceHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Journey</h3>
              <div className="space-y-3">
                {choiceHistory.map((choice, index) => {
                  // For the last choice, check if there's a terminal outcome
                  // Terminal outcomes are added after the choice, so if outcomeHistory has one more entry
                  // than choiceHistory, the last choice should use the last outcome
                  const isLastChoice = index === choiceHistory.length - 1;
                  const outcomeIndex = isLastChoice && outcomeHistory.length > choiceHistory.length 
                    ? outcomeHistory.length - 1 
                    : index;
                  const outcome = outcomeHistory[outcomeIndex];
                  
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{choice.text}</p>
                        {outcome && (
                          <p className="text-sm text-gray-600 mt-1">
                            {outcome.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            Confidence: {choice.confidenceLevel}/10
                          </span>
                          {outcome && (
                            <span className={`text-xs font-semibold ${
                              outcome.reward > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Reward: {outcome.reward > 0 ? '+' : ''}{outcome.reward}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={choiceHistory.length === 0 ? () => setPhase('playing') : resetGame}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              {choiceHistory.length === 0 ? 'Start Adventure' : 'Play Again'} 
              {choiceHistory.length === 0 ? <ArrowRight className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
            </button>
            {choiceHistory.length > 0 && (
              <button
                onClick={() => setSelectedMode(null)}
                className="bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                ← Back to Modes
              </button>
            )}
            <button
              onClick={() => setSelectedMode(null)}
              className="bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    const currentNode = storyNodes[currentNodeId];
    
    if (!currentNode) {
      setPhase('finished');
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Current Confidence</span>
                <span className="font-bold text-indigo-600">{currentValue.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${(currentValue / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Situation */}
            <div className="bg-indigo-50 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-800">{currentNode.situation}</p>
            </div>

            {/* Choices */}
            <div className="space-y-3 mb-6">
              <p className="font-semibold text-gray-700 mb-3">What do you do?</p>
              {currentNode.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-600">{choice.id.toUpperCase()}.</span>
                    <span className="text-sm text-gray-500">Confidence: {choice.confidenceLevel}/10</span>
                  </div>
                  <p className="mt-1 text-gray-800">{choice.text}</p>
                </button>
              ))}
            </div>

            {/* Show outcome if available */}
            {currentNode.outcome && (
              <div className={`rounded-lg p-4 mb-4 ${
                currentNode.outcome.reward > 0 ? 'bg-green-50 border-l-4 border-green-600' : 'bg-red-50 border-l-4 border-red-600'
              }`}>
                <p className="text-gray-800">{currentNode.outcome.description}</p>
                <p className={`text-sm font-semibold mt-2 ${
                  currentNode.outcome.reward > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  Reward: {currentNode.outcome.reward > 0 ? '+' : ''}{currentNode.outcome.reward}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    const finalNode = storyNodes[currentNodeId];
    const estimated = estimateLearningRates();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Journey Complete</h2>
            
            {finalNode?.outcome && (
              <div className={`rounded-lg p-6 mb-6 ${
                finalNode.outcome.reward > 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className="text-lg text-gray-800 mb-2">{finalNode.situation}</p>
                <p className="text-gray-700">{finalNode.outcome.description}</p>
              </div>
            )}

            {/* Final Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4">Final Confidence</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {currentValue.toFixed(1)}/10
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-indigo-600 h-4 rounded-full"
                    style={{ width: `${(currentValue / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4">Learning Rates</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Positive (α⁺)</span>
                      <span className="font-bold text-green-600">{estimated.positiveLearningRate.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(estimated.positiveLearningRate / 0.9) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Negative (α⁻)</span>
                      <span className="font-bold text-red-600">{estimated.negativeLearningRate.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(estimated.negativeLearningRate / 0.9) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" /> Play Again
              </button>
              <button
                onClick={() => setPhase('landing')}
                className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                View Stats
              </button>
              <button
                onClick={() => setSelectedMode(null)}
                className="bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                ← Back to Modes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default OutcomeMode;

