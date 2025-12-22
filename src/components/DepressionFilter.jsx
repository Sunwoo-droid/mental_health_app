import React, { useState } from 'react';
import { LockClosedIcon, ArrowTrendingDownIcon, ArrowRightIcon, ArrowPathIcon, ExclamationCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';

// ============================================
// DEPRESSION FILTER MODE
// ============================================
// Experience how depression's learning rates create a "filter" that blocks
// positive experiences from raising confidence

function DepressionFilter({ setSelectedMode }) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [phase, setPhase] = useState('intro'); // 'intro' | 'playing' | 'finished'
  const [currentValue, setCurrentValue] = useState(5); // Confidence value (0-10)
  const [valueHistory, setValueHistory] = useState([5]);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [outcomeHistory, setOutcomeHistory] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  
  // Fixed depressed learning rates (simulating depression)
  const positiveLearningRate = 0.1;  // Low - positive experiences barely register
  const negativeLearningRate = 0.8;  // High - negative experiences hit hard
  
  // ============================================
  // BRANCHING SCENARIO STRUCTURE
  // ============================================
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
    // Terminal nodes
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
      situation: "The morning was okay. You feel included but not fully engaged.",
      isTerminal: true,
      outcome: {
        reward: 6,
        description: "It was a decent morning. You're included, but you feel like you could have engaged more."
      }
    },
    added_to_joke: {
      id: 'added_to_joke',
      situation: "You're feeling okay. The group dynamic is positive.",
      isTerminal: true,
      outcome: {
        reward: 8,
        description: "Good morning! You contributed to the fun and feel somewhat valued."
      }
    },
    enjoyed_moment: {
      id: 'enjoyed_moment',
      situation: "You're content. The morning was pleasant.",
      isTerminal: true,
      outcome: {
        reward: 7,
        description: "A nice, comfortable morning with friends. Nothing spectacular, but okay."
      }
    },
    organizer: {
      id: 'organizer',
      situation: "You're included in planning! That feels good.",
      isTerminal: true,
      outcome: {
        reward: 9,
        description: "You're helping organize! This feels good - you're part of the group."
      }
    },
    confirmed: {
      id: 'confirmed',
      situation: "You're going to the party! That's something to look forward to.",
      isTerminal: true,
      outcome: {
        reward: 7,
        description: "You're included in the plans. Looking forward to the weekend."
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
      situation: "You opened up a bit. That felt okay.",
      isTerminal: true,
      outcome: {
        reward: 7,
        description: "Sharing felt a bit vulnerable. Your friends listened and responded."
      }
    },
    asked_plans: {
      id: 'asked_plans',
      situation: "You showed interest. That's connection.",
      isTerminal: true,
      outcome: {
        reward: 6,
        description: "Good conversation! You're building connections by showing interest."
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
      situation: "You joined naturally. That felt okay.",
      isTerminal: true,
      outcome: {
        reward: 6,
        description: "You recovered okay. The morning ended on a neutral note."
      }
    },
    caught_up_walk: {
      id: 'caught_up_walk',
      situation: "You tried to reconnect. That took effort.",
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
    // Normalize reward to 0-10 scale
    const normalizedReward = 5 + (reward * 0.4);
    
    // Calculate Reward Prediction Error
    const rpe = normalizedReward - currentVal;
    
    // Select learning rate based on outcome sign (using depressed rates)
    const alpha = rpe > 0 ? positiveLearningRate : negativeLearningRate;
    
    // TD Update: V(t+1) = V(t) + α[r - V(t)]
    const newValue = currentVal + (alpha * rpe);
    
    // Clamp to 0-10 range
    return Math.max(0, Math.min(10, newValue));
  };

  // ============================================
  // CHOICE HANDLING
  // ============================================

  const handleChoice = (choice) => {
    
    // Record choice
    const updatedChoiceHistory = [...choiceHistory, choice];
    setChoiceHistory(updatedChoiceHistory);
    
    // Track outcomes and values
    let updatedOutcomeHistory = [...outcomeHistory];
    let updatedValueHistory = [...valueHistory];
    let updatedCurrentValue = currentValue;
    
    // Move to next node
    if (choice.nextNodeId) {
      const nextNode = storyNodes[choice.nextNodeId];
      
      // Record outcome of the node we're ARRIVING at (not leaving)
      // This way the outcome shows up when you arrive at the new node
      if (nextNode.outcome) {
        updatedOutcomeHistory = [...updatedOutcomeHistory, nextNode.outcome];
        
        // Update value using TD learning with depressed rates
        updatedCurrentValue = updateValueWithTD(nextNode.outcome.reward, updatedCurrentValue);
        updatedValueHistory = [...updatedValueHistory, updatedCurrentValue];
        
        // Update state
        setOutcomeHistory(updatedOutcomeHistory);
        setCurrentValue(updatedCurrentValue);
        setValueHistory(updatedValueHistory);
      }
      
      if (nextNode.isTerminal) {
        // Handle terminal node - already processed outcome above
        setPhase('finished');
      } else {
        setCurrentNodeId(choice.nextNodeId);
      }
    }
  };

  const resetGame = () => {
    setPhase('intro');
    setCurrentValue(5);
    setValueHistory([5]);
    setChoiceHistory([]);
    setOutcomeHistory([]);
    setCurrentNodeId('start');
  };

  // Check if a choice is blocked (requires confidence higher than current)
  const isChoiceBlocked = (choice) => {
    return choice.confidenceLevel > currentValue;
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-rose-500/30 p-8 mb-6 rounded-lg shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-2xl border border-rose-500/30">
                <FunnelIcon className="w-16 h-16 text-rose-400" />
              </div>
            </div>
            <h1 className="text-4xl font-medium text-center mb-4 text-slate-100">
              Depression Filter Mode
            </h1>
            <p className="text-lg text-slate-300 text-center mb-8">
              Experience what it's like to have depression's "mental filter" - where good experiences barely help, but bad ones hit hard.
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 mb-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-medium text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
              Understanding the Depression Filter
            </h2>
            
            <div className="space-y-6">
              <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 ">
                <h3 className="font-medium text-slate-100 mb-2">What You'll Experience</h3>
                <p className="text-slate-300 mb-4">
                  In this mode, you'll navigate scenarios with <strong>depression-like settings</strong>:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-green-500/10 rounded-lg">
                        <ArrowTrendingDownIcon className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="font-medium text-slate-100">How much good experiences affect confidence</span>
                    </div>
                    <p className="text-2xl font-medium text-green-400 mb-1">0.1</p>
                    <p className="text-sm text-slate-300">
                      Good experiences barely help. Even when good things happen, your confidence barely increases.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-red-500/10 rounded-lg">
                        <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="font-medium text-slate-100">How much bad experiences affect confidence</span>
                    </div>
                    <p className="text-2xl font-medium text-red-400 mb-1">0.8</p>
                    <p className="text-sm text-slate-300">
                      Bad experiences hit really hard. One bad moment can dramatically lower your confidence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 ">
                <h3 className="font-medium text-slate-100 mb-2">The Mental Filter Effect</h3>
                <p className="text-slate-300 mb-3">
                  Because good experiences barely help, your confidence struggles to rise. This creates a "filter" where:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                  <li><strong>Some choices become unavailable</strong> - You literally cannot choose options that require more confidence than you have</li>
                  <li><strong>Good outcomes barely help</strong> - Even when good things happen, your confidence increases by tiny amounts</li>
                  <li><strong>Bad outcomes are devastating</strong> - Bad experiences cause large drops in confidence</li>
                  <li><strong>You get "stuck" at low confidence</strong> - The filter prevents you from accessing choices that could help you build confidence</li>
                </ul>
              </div>

              <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 rounded-lg">
                <h3 className="font-medium text-slate-100 mb-2">How It Works</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Your confidence changes based on what happens. With depression-like settings:
                </p>
                <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside mb-3">
                  <li>When something <strong>good</strong> happens: Your confidence increases by only a tiny amount (0.1)</li>
                  <li>When something <strong>bad</strong> happens: Your confidence decreases by a large amount (0.8)</li>
                </ul>
                <p className="text-sm text-slate-300">
                  This means good experiences can't build up your confidence, while bad experiences quickly bring it down. 
                  This creates a cycle that's hard to break.
                </p>
              </div>

              <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 ">
                <div className="flex items-start gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-slate-100 mb-2">What This Means</h3>
                    <p className="text-slate-300">
                      This isn't about "thinking more positively" - it's about a fundamental change in how the brain processes 
                      experiences. The depressed learning rates create a filter that makes it nearly impossible to build confidence, 
                      even when positive things happen. This is why depression is so hard to overcome without treatment - the brain's 
                      learning mechanism itself is broken.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setPhase('playing')}
              className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 px-6 font-medium hover:from-rose-500 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-rose-500/50 rounded-lg flex items-center justify-center gap-2"
            >
              Begin Experience <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedMode(null)}
              className="bg-slate-800 text-slate-300 py-3 px-6 border border-slate-700 font-medium hover:bg-slate-700 transition rounded-lg"
            >
              ← Back to Modes
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
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-lg shadow-xl">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Current Confidence</span>
                <span className="font-medium text-slate-400">{currentValue.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentValue / 10) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Positive Learning: {positiveLearningRate}</span>
                <span>Negative Learning: {negativeLearningRate}</span>
              </div>
            </div>

            {/* Show last outcome if available (from previous choice) - at top */}
            {outcomeHistory.length > 0 && outcomeHistory[outcomeHistory.length - 1] && valueHistory.length >= 2 && (() => {
              const lastOutcome = outcomeHistory[outcomeHistory.length - 1];
              const previousValue = valueHistory[valueHistory.length - 2];
              const confidenceChange = currentValue - previousValue;
              const isPositiveChange = confidenceChange > 0;
              const learningRateUsed = isPositiveChange ? positiveLearningRate : negativeLearningRate;
              
              return (
                <div className={`p-6 mb-6 border-l-4 rounded-lg ${
                  isPositiveChange 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500' 
                    : 'bg-gradient-to-br from-red-900/30 to-rose-900/20 border-red-500'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100 mb-2">Outcome</h3>
                      <p className="text-slate-300 mb-2">{lastOutcome.description}</p>
                    </div>
                    <div className={`text-right ml-4 ${
                      isPositiveChange 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      <div className="text-2xl font-medium">
                        {lastOutcome.reward > 0 ? '+' : ''}
                        {lastOutcome.reward}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">Reward</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-3 mt-3 border border-slate-600 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Confidence Change:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">
                          {previousValue.toFixed(1)}/10
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`font-medium ${
                          isPositiveChange
                            ? 'text-green-400'
                            : confidenceChange < 0
                            ? 'text-slate-400'
                            : 'text-slate-300'
                        }`}>
                          {currentValue.toFixed(1)}/10
                        </span>
                        {confidenceChange !== 0 && (
                          <span className={`text-sm font-medium ${
                            isPositiveChange
                              ? 'text-green-400'
                              : 'text-slate-400'
                          }`}>
                            ({isPositiveChange ? '+' : ''}
                            {confidenceChange.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      With depressed learning rates (α{isPositiveChange ? '⁺' : '⁻'}={learningRateUsed}), this outcome 
                      {isPositiveChange ? ' barely increased' : ' significantly decreased'} your confidence.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Situation */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 mb-6 rounded-lg border border-slate-600">
              <p className="text-lg text-slate-100">{currentNode.situation}</p>
            </div>

            {/* Choices */}
            <div className="space-y-3 mb-6">
              <p className="font-medium text-slate-300 mb-3">What do you do?</p>
              {currentNode.choices.map((choice) => {
                const blocked = isChoiceBlocked(choice);
                return (
                  <button
                    key={choice.id}
                    onClick={() => !blocked && handleChoice(choice)}
                    disabled={blocked}
                    className={`w-full text-left p-4 transition rounded-lg ${
                      blocked
                        ? 'bg-slate-800 border border-slate-600 cursor-not-allowed opacity-60'
                        : 'bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${blocked ? 'text-gray-400' : 'text-slate-400'}`}>
                          {choice.id.toUpperCase()}.
                        </span>
                        {blocked && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <LockClosedIcon className="w-3 h-3" />
                            <span>Requires confidence {choice.confidenceLevel}/10</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-sm ${blocked ? 'text-gray-400' : 'text-gray-500'}`}>
                        Confidence: {choice.confidenceLevel}/10
                      </span>
                    </div>
                    <p className={`${blocked ? 'text-gray-400' : 'text-slate-100'}`}>{choice.text}</p>
                    {blocked && (
                      <p className="text-xs text-slate-400 mt-2 italic">
                        Blocked: Your current confidence ({currentValue.toFixed(1)}/10) is too low for this choice.
                        The depression filter prevents you from accessing higher-confidence options.
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-medium text-slate-100 mb-6 text-center">Experience Complete</h2>
            
            {/* Final Outcome - integrated with confidence change */}
            {outcomeHistory.length > 0 && outcomeHistory[outcomeHistory.length - 1] && valueHistory.length >= 2 && (() => {
              const lastOutcome = outcomeHistory[outcomeHistory.length - 1];
              const previousValue = valueHistory[valueHistory.length - 2];
              const confidenceChange = currentValue - previousValue;
              const isPositiveChange = confidenceChange > 0;
              const learningRateUsed = isPositiveChange ? positiveLearningRate : negativeLearningRate;
              
              return (
                <div className={`p-6 mb-6 border-l-4 rounded-lg ${
                  isPositiveChange
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500'
                    : 'bg-gradient-to-br from-red-900/30 to-rose-900/20 border-red-500'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100 mb-2">Final Outcome</h3>
                      <p className="text-slate-300 mb-2">{lastOutcome.description}</p>
                    </div>
                    <div className={`text-right ml-4 ${
                      isPositiveChange
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      <div className="text-2xl font-medium">
                        {lastOutcome.reward > 0 ? '+' : ''}
                        {lastOutcome.reward}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">Reward</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-3 mt-3 border border-slate-600 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Confidence Change:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">
                          {previousValue.toFixed(1)}/10
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`font-medium ${
                          isPositiveChange
                            ? 'text-green-400'
                            : confidenceChange < 0
                            ? 'text-slate-400'
                            : 'text-slate-300'
                        }`}>
                          {currentValue.toFixed(1)}/10
                        </span>
                        {confidenceChange !== 0 && (
                          <span className={`text-sm font-medium ${
                            isPositiveChange
                              ? 'text-green-400'
                              : 'text-slate-400'
                          }`}>
                            ({isPositiveChange ? '+' : ''}
                            {confidenceChange.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      With depressed learning rates (α{isPositiveChange ? '⁺' : '⁻'}={learningRateUsed}), this outcome 
                      {isPositiveChange ? ' barely increased' : ' significantly decreased'} your confidence.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Final Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-lg border border-slate-600">
                <h3 className="font-medium text-slate-100 mb-4">Final Confidence</h3>
                <div className="text-4xl font-medium text-slate-400 mb-2">
                  {currentValue.toFixed(1)}/10
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(currentValue / 10) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-slate-300 mt-2">
                  Notice how your confidence stayed low despite positive experiences. 
                  This is the depression filter in action.
                </p>
              </div>

              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-lg border border-slate-600">
                <h3 className="font-medium text-slate-100 mb-4">Learning Rates Used</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Positive (α⁺)</span>
                      <span className="font-medium text-slate-400">{positiveLearningRate.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(positiveLearningRate / 0.9) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Very low - positive experiences barely register</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Negative (α⁻)</span>
                      <span className="font-medium text-slate-400">{negativeLearningRate.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(negativeLearningRate / 0.9) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Very high - negative experiences hit hard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-l-4 border-slate-600 p-6 mb-6 rounded-lg">
              <h3 className="font-medium text-slate-100 mb-2">Reflection</h3>
              <p className="text-slate-300">
                Did you notice how many choices were blocked? How even when positive things happened, your confidence 
                barely increased? This is what it feels like to have depression - not just "feeling sad," but having 
                a brain that literally cannot learn from positive experiences. The filter makes it nearly impossible 
                to build confidence, creating a cycle that's hard to break without treatment.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 px-6 font-medium hover:from-rose-500 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-rose-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" /> Play Again
              </button>
              <button
                onClick={() => setSelectedMode(null)}
                className="bg-slate-800 text-slate-300 py-3 px-6 border border-slate-700 font-medium hover:bg-slate-700 transition rounded-lg"
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

export default DepressionFilter;
