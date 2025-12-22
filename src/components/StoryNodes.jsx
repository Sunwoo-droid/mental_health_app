// ============================================
// SHARED STORY NODES STRUCTURE
// ============================================
// This file contains the branching narrative structure used by
// OutcomeMode, AgentMode, and potentially other components.
// Each node has: id, situation, choices (with nextNodeId), and outcomes
// All paths are designed to be 12 steps long, spanning a single day from waking up to bedtime
// Each situation has 3 possible decisions

export const storyNodes = {
  start: {
    id: 'start',
    situation: "Your alarm goes off. It's 6:30 AM and still dark outside. You have a full day of school ahead.",
    choices: [
      {
        id: 'a',
        text: "Get up immediately, feeling ready for the day",
        confidenceLevel: 8,
        nextNodeId: 'woke_up_energetic'
      },
      {
        id: 'b',
        text: "Hit snooze once, then get up",
        confidenceLevel: 5,
        nextNodeId: 'woke_up_normal'
      },
      {
        id: 'c',
        text: "Keep hitting snooze until you're running late",
        confidenceLevel: 2,
        nextNodeId: 'woke_up_late'
      }
    ]
  },

  // Path A: High confidence morning start
  woke_up_energetic: {
    id: 'woke_up_energetic',
    situation: "You're up and feeling good. You have time to get ready without rushing.",
    choices: [
      {
        id: 'a',
        text: "Take a quick shower and pick out a nice outfit",
        confidenceLevel: 8,
        nextNodeId: 'ready_confident'
      },
      {
        id: 'b',
        text: "Do a quick routine and grab whatever's clean",
        confidenceLevel: 6,
        nextNodeId: 'ready_quick'
      },
      {
        id: 'c',
        text: "Spend extra time on your appearance",
        confidenceLevel: 7,
        nextNodeId: 'ready_extra_time'
      }
    ],
    outcome: {
      reward: 6,
      description: "Starting the day with energy feels great. You're ahead of schedule."
    }
  },
  ready_confident: {
    id: 'ready_confident',
    situation: "You look good and feel confident. Heading downstairs, you smell breakfast cooking.",
    choices: [
      {
        id: 'a',
        text: "Join your family for breakfast and chat",
        confidenceLevel: 8,
        nextNodeId: 'breakfast_social'
      },
      {
        id: 'b',
        text: "Grab something quick and eat alone",
        confidenceLevel: 6,
        nextNodeId: 'breakfast_quick'
      },
      {
        id: 'c',
        text: "Skip breakfast to save time",
        confidenceLevel: 5,
        nextNodeId: 'breakfast_skipped'
      }
    ],
    outcome: {
      reward: 7,
      description: "You're ready and feeling good about yourself."
    }
  },
  breakfast_social: {
    id: 'breakfast_social',
    situation: "Your family is at the table. Your sibling is on their phone, and your parent asks what you have planned for today.",
    choices: [
      {
        id: 'a',
        text: "Share your plans and ask about theirs",
        confidenceLevel: 8,
        nextNodeId: 'family_engaged'
      },
      {
        id: 'b',
        text: "Give a brief answer and focus on eating",
        confidenceLevel: 6,
        nextNodeId: 'family_brief'
      },
      {
        id: 'c',
        text: "Try to avoid conversation",
        confidenceLevel: 4,
        nextNodeId: 'family_avoided'
      }
    ],
    outcome: {
      reward: 7,
      description: "Breakfast with family feels warm and connected."
    }
  },
  family_engaged: {
    id: 'family_engaged',
    situation: "The conversation flows. Your parent seems happy you're engaging. Time to head to school.",
    choices: [
      {
        id: 'a',
        text: "Walk to school with a friend who lives nearby",
        confidenceLevel: 8,
        nextNodeId: 'arrived_with_friend'
      },
      {
        id: 'b',
        text: "Take the bus and find your usual seat",
        confidenceLevel: 6,
        nextNodeId: 'arrived_bus'
      },
      {
        id: 'c',
        text: "Get a ride and arrive early",
        confidenceLevel: 7,
        nextNodeId: 'arrived_early'
      }
    ],
    outcome: {
      reward: 8,
      description: "Great morning start! You feel connected and ready."
    }
  },
  arrived_with_friend: {
    id: 'arrived_with_friend',
    situation: "You walk to school with a friend from your neighborhood, talking about the day ahead. You arrive at the front entrance.",
    choices: [
      {
        id: 'a',
        text: "Head to your locker and find the rest of your friend group",
        confidenceLevel: 8,
        nextNodeId: 'found_friends_before_class'
      },
      {
        id: 'b',
        text: "Go straight to your first class to get settled",
        confidenceLevel: 6,
        nextNodeId: 'went_straight_class'
      },
      {
        id: 'c',
        text: "Stop by the bathroom first",
        confidenceLevel: 5,
        nextNodeId: 'stopped_bathroom'
      }
    ],
    outcome: {
      reward: 7,
      description: "Walking with a friend made the morning commute pleasant."
    }
  },
  found_friends_before_class: {
    id: 'found_friends_before_class',
    situation: "You find your friend group by the lockers. They're laughing about something that happened over the weekend.",
    choices: [
      {
        id: 'a',
        text: "Jump into the conversation enthusiastically",
        confidenceLevel: 9,
        nextNodeId: 'class_high_energy'
      },
      {
        id: 'b',
        text: "Listen and add comments when appropriate",
        confidenceLevel: 7,
        nextNodeId: 'class_balanced'
      },
      {
        id: 'c',
        text: "Stand nearby but stay quiet",
        confidenceLevel: 4,
        nextNodeId: 'class_quiet'
      }
    ],
    outcome: {
      reward: 8,
      description: "Connecting with friends before class boosts your mood."
    }
  },
  class_high_energy: {
    id: 'class_high_energy',
    situation: "The bell rings. You head to your first class feeling energized. Your teacher announces a pop quiz.",
    choices: [
      {
        id: 'a',
        text: "Feel confident and ready to tackle it",
        confidenceLevel: 8,
        nextNodeId: 'quiz_confident'
      },
      {
        id: 'b',
        text: "Feel nervous but try your best",
        confidenceLevel: 5,
        nextNodeId: 'quiz_nervous'
      },
      {
        id: 'c',
        text: "Feel unprepared and anxious",
        confidenceLevel: 3,
        nextNodeId: 'quiz_anxious'
      }
    ],
    outcome: {
      reward: 7,
      description: "You arrive at class feeling energized and ready. The positive energy from connecting with friends carries into the classroom."
    }
  },
  quiz_confident: {
    id: 'quiz_confident',
    situation: "You finish the quiz feeling okay about it. Class ends and you have a few minutes before your next class.",
    choices: [
      {
        id: 'a',
        text: "Chat with classmates about the quiz",
        confidenceLevel: 8,
        nextNodeId: 'between_classes_social'
      },
      {
        id: 'b',
        text: "Quickly review your notes for next class",
        confidenceLevel: 6,
        nextNodeId: 'between_classes_prep'
      },
      {
        id: 'c',
        text: "Head to your next class early",
        confidenceLevel: 5,
        nextNodeId: 'between_classes_early'
      }
    ],
    outcome: {
      reward: 7,
      description: "You work through the quiz with confidence. The questions are challenging, but you're in a good headspace and able to focus. You feel good about your performance."
    }
  },
  between_classes_social: {
    id: 'between_classes_social',
    situation: "You're chatting in the hallway. Someone mentions a group project due next week that you forgot about.",
    choices: [
      {
        id: 'a',
        text: "Offer to take the lead and organize the group",
        confidenceLevel: 8,
        nextNodeId: 'second_class_leader'
      },
      {
        id: 'b',
        text: "Suggest meeting during lunch to plan",
        confidenceLevel: 6,
        nextNodeId: 'second_class_collaborative'
      },
      {
        id: 'c',
        text: "Feel stressed and try to figure it out alone",
        confidenceLevel: 4,
        nextNodeId: 'second_class_stressed'
      }
    ],
    outcome: {
      reward: 6,
      description: "The conversation was good, but the project news adds some pressure."
    }
  },
  second_class_leader: {
    id: 'second_class_leader',
    situation: "You're in your second class. The teacher pairs you up with someone you don't know well for a quick activity.",
    choices: [
      {
        id: 'a',
        text: "Introduce yourself and take initiative",
        confidenceLevel: 8,
        nextNodeId: 'lunch_positive'
      },
      {
        id: 'b',
        text: "Wait for them to start the conversation",
        confidenceLevel: 5,
        nextNodeId: 'lunch_neutral'
      },
      {
        id: 'c',
        text: "Feel awkward and struggle to engage",
        confidenceLevel: 3,
        nextNodeId: 'lunch_awkward'
      }
    ],
    outcome: {
      reward: 7,
      description: "You arrive at your second class feeling confident after taking the lead in organizing the group project. The teacher's pairing announcement catches your attention."
    }
  },
  lunch_positive: {
    id: 'lunch_positive',
    situation: "Lunch period! You head to the cafeteria. Your usual table has space, but you also see someone sitting alone.",
    choices: [
      {
        id: 'a',
        text: "Join your usual group and have a great time",
        confidenceLevel: 8,
        nextNodeId: 'afternoon_energized'
      },
      {
        id: 'b',
        text: "Invite the person sitting alone to join your table",
        confidenceLevel: 6,
        nextNodeId: 'afternoon_inclusive'
      },
      {
        id: 'c',
        text: "Sit with a different group to mix things up",
        confidenceLevel: 5,
        nextNodeId: 'afternoon_new_group'
      }
    ],
    outcome: {
      reward: 7,
      description: "The class activity went well. You introduced yourself and took initiative, which felt good. Now lunch period has arrived."
    }
  },
  afternoon_energized: {
    id: 'afternoon_energized',
    situation: "Afternoon classes begin. You're feeling good, but the afternoon drags. Your last class has a substitute teacher showing a movie.",
    choices: [
      {
        id: 'a',
        text: "Stay focused and get your work done",
        confidenceLevel: 7,
        nextNodeId: 'after_school_productive'
      },
      {
        id: 'b',
        text: "Chat quietly with friends during the movie",
        confidenceLevel: 5,
        nextNodeId: 'after_school_relaxed'
      },
      {
        id: 'c',
        text: "Zone out and think about after school",
        confidenceLevel: 4,
        nextNodeId: 'after_school_distracted'
      }
    ],
    outcome: {
      reward: 6,
      description: "Lunch with your usual group was fun and energizing. You're feeling good as afternoon classes begin."
    }
  },
  after_school_productive: {
    id: 'after_school_productive',
    situation: "School's out! You have a few options: go home, hang out with friends, or attend a club meeting.",
    choices: [
      {
        id: 'a',
        text: "Hang out with friends at the park nearby",
        confidenceLevel: 8,
        nextNodeId: 'home_social'
      },
      {
        id: 'b',
        text: "Go to a club meeting you're interested in",
        confidenceLevel: 6,
        nextNodeId: 'home_club'
      },
      {
        id: 'c',
        text: "Head straight home to relax",
        confidenceLevel: 5,
        nextNodeId: 'home_direct'
      }
    ],
    outcome: {
      reward: 7,
      description: "You stayed focused during the afternoon classes and got your work done. The school day is finally over, and you feel accomplished."
    }
  },
  home_social: {
    id: 'home_social',
    situation: "After hanging out with friends, you're heading home. Your family asks about your day when you arrive.",
    choices: [
      {
        id: 'a',
        text: "Share highlights and ask about their day",
        confidenceLevel: 8,
        nextNodeId: 'evening_connected'
      },
      {
        id: 'b',
        text: "Give a brief summary and head to your room",
        confidenceLevel: 5,
        nextNodeId: 'evening_quiet'
      },
      {
        id: 'c',
        text: "Say 'fine' and avoid further conversation",
        confidenceLevel: 3,
        nextNodeId: 'evening_isolated'
      }
    ],
    outcome: {
      reward: 7,
      description: "Hanging out with friends after school was nice. You feel more connected and positive as you arrive home."
    }
  },
  evening_connected: {
    id: 'evening_connected',
    situation: "Evening settles in. You have homework, but you also want to relax. Your phone buzzes with messages from friends.",
    choices: [
      {
        id: 'a',
        text: "Do homework first, then relax and respond to messages",
        confidenceLevel: 8,
        nextNodeId: 'bedtime_balanced'
      },
      {
        id: 'b',
        text: "Chat with friends first, then do homework",
        confidenceLevel: 6,
        nextNodeId: 'bedtime_late'
      },
      {
        id: 'c',
        text: "Put off homework and just relax",
        confidenceLevel: 4,
        nextNodeId: 'bedtime_stressed'
      }
    ],
    outcome: {
      reward: 7,
      description: "Sharing your day with family felt good. You had a nice conversation and feel connected. Now evening is settling in."
    }
  },
  bedtime_balanced: {
    id: 'bedtime_balanced',
    situation: "It's getting late. You've finished your homework and had time to relax. You're ready for bed.",
    isTerminal: true,
    outcome: {
      reward: 8,
      description: "You had a great day. You feel accomplished, connected, and ready for a good night's sleep. Tomorrow looks promising."
    }
  },

  // Branching paths from high confidence start
  ready_quick: {
    id: 'ready_quick',
    situation: "You're ready quickly. Heading downstairs, breakfast is ready.",
    choices: [
      {
        id: 'a',
        text: "Eat breakfast with family",
        confidenceLevel: 6,
        nextNodeId: 'breakfast_social'
      },
      {
        id: 'b',
        text: "Grab something and go",
        confidenceLevel: 5,
        nextNodeId: 'breakfast_quick'
      },
      {
        id: 'c',
        text: "Skip breakfast",
        confidenceLevel: 4,
        nextNodeId: 'breakfast_skipped'
      }
    ],
    outcome: {
      reward: 5,
      description: "You're ready, though you rushed a bit."
    }
  },
  ready_extra_time: {
    id: 'ready_extra_time',
    situation: "You spent extra time getting ready. You look great, but you're running a bit behind.",
    choices: [
      {
        id: 'a',
        text: "Skip breakfast to make up time",
        confidenceLevel: 6,
        nextNodeId: 'breakfast_skipped'
      },
      {
        id: 'b',
        text: "Grab something quick",
        confidenceLevel: 5,
        nextNodeId: 'breakfast_quick'
      },
      {
        id: 'c',
        text: "Take time for breakfast anyway",
        confidenceLevel: 4,
        nextNodeId: 'breakfast_social'
      }
    ],
    outcome: {
      reward: 6,
      description: "You look good, but time is tight."
    }
  },
  breakfast_quick: {
    id: 'breakfast_quick',
    situation: "You grab something quick. Your family is around but you're focused on getting out the door.",
    choices: [
      {
        id: 'a',
        text: "Take the bus to school",
        confidenceLevel: 6,
        nextNodeId: 'arrived_bus'
      },
      {
        id: 'b',
        text: "Walk with a friend if they're ready",
        confidenceLevel: 5,
        nextNodeId: 'arrived_with_friend'
      },
      {
        id: 'c',
        text: "Get a ride",
        confidenceLevel: 5,
        nextNodeId: 'arrived_early'
      }
    ],
    outcome: {
      reward: -2,
      description: "In your rush, you knock over a glass of juice. It spills on the counter and your family gives you a look. You quickly clean it up, but you feel flustered and a bit embarrassed. The morning isn't going as smoothly as you'd hoped."
    }
  },
  breakfast_skipped: {
    id: 'breakfast_skipped',
    situation: "You skip breakfast. Your stomach rumbles, but you're on time. Heading to school.",
    choices: [
      {
        id: 'a',
        text: "Take the bus",
        confidenceLevel: 5,
        nextNodeId: 'arrived_bus'
      },
      {
        id: 'b',
        text: "Walk with a friend",
        confidenceLevel: 4,
        nextNodeId: 'arrived_with_friend'
      },
      {
        id: 'c',
        text: "Get a ride",
        confidenceLevel: 4,
        nextNodeId: 'arrived_early'
      }
    ],
    outcome: {
      reward: 3,
      description: "You're on time, but skipping breakfast leaves you a bit hungry."
    }
  },
  family_brief: {
    id: 'family_brief',
    situation: "You give brief answers. The conversation is minimal. Time to head to school.",
    choices: [
      {
        id: 'a',
        text: "Take the bus",
        confidenceLevel: 6,
        nextNodeId: 'arrived_bus'
      },
      {
        id: 'b',
        text: "Walk with a friend",
        confidenceLevel: 5,
        nextNodeId: 'arrived_with_friend'
      },
      {
        id: 'c',
        text: "Get a ride",
        confidenceLevel: 5,
        nextNodeId: 'arrived_early'
      }
    ],
    outcome: {
      reward: 4,
      description: "Breakfast was okay, but you didn't connect much."
    }
  },
  family_avoided: {
    id: 'family_avoided',
    situation: "You avoid conversation. There's some tension, but you finish and head to school.",
    choices: [
      {
        id: 'a',
        text: "Take the bus",
        confidenceLevel: 4,
        nextNodeId: 'arrived_bus'
      },
      {
        id: 'b',
        text: "Walk alone",
        confidenceLevel: 3,
        nextNodeId: 'arrived_alone'
      },
      {
        id: 'c',
        text: "Get a ride",
        confidenceLevel: 4,
        nextNodeId: 'arrived_early'
      }
    ],
    outcome: {
      reward: 2,
      description: "Breakfast was awkward. You're ready to get to school."
    }
  },
  arrived_bus: {
    id: 'arrived_bus',
    situation: "You take the bus. You find your usual seat and chat with the person next to you.",
    choices: [
      {
        id: 'a',
        text: "Have a good conversation on the way",
        confidenceLevel: 7,
        nextNodeId: 'went_straight_class'
      },
      {
        id: 'b',
        text: "Keep to yourself and listen to music",
        confidenceLevel: 4,
        nextNodeId: 'went_straight_class'
      },
      {
        id: 'c',
        text: "Feel tired and zone out",
        confidenceLevel: 3,
        nextNodeId: 'stopped_bathroom'
      }
    ],
    outcome: {
      reward: 5,
      description: "The bus ride was uneventful."
    }
  },
  arrived_early: {
    id: 'arrived_early',
    situation: "You arrive early. The halls are quiet. You have time before class starts.",
    choices: [
      {
        id: 'a',
        text: "Find your friends at their lockers",
        confidenceLevel: 7,
        nextNodeId: 'found_friends_before_class'
      },
      {
        id: 'b',
        text: "Go to your locker and then to class",
        confidenceLevel: 5,
        nextNodeId: 'went_straight_class'
      },
      {
        id: 'c',
        text: "Find a quiet spot to review notes",
        confidenceLevel: 6,
        nextNodeId: 'went_straight_class'
      }
    ],
    outcome: {
      reward: 6,
      description: "Arriving early gives you a calm start."
    }
  },
  arrived_alone: {
    id: 'arrived_alone',
    situation: "You arrive at school alone. The halls are filling up with students.",
    choices: [
      {
        id: 'a',
        text: "Look for your friends",
        confidenceLevel: 5,
        nextNodeId: 'found_friends_before_class'
      },
      {
        id: 'b',
        text: "Go straight to your locker and class",
        confidenceLevel: 4,
        nextNodeId: 'went_straight_class'
      },
      {
        id: 'c',
        text: "Find a quiet corner to wait",
        confidenceLevel: 3,
        nextNodeId: 'went_straight_class'
      }
    ],
    outcome: {
      reward: 3,
      description: "You arrive alone, feeling a bit isolated."
    }
  },
  went_straight_class: {
    id: 'went_straight_class',
    situation: "You go straight to class. A few classmates are already there, but it's mostly empty.",
    choices: [
      {
        id: 'a',
        text: "Chat with the classmates who are there",
        confidenceLevel: 6,
        nextNodeId: 'class_balanced'
      },
      {
        id: 'b',
        text: "Sit quietly and wait for class to start",
        confidenceLevel: 4,
        nextNodeId: 'class_quiet'
      },
      {
        id: 'c',
        text: "Review your notes from last class",
        confidenceLevel: 5,
        nextNodeId: 'class_balanced'
      }
    ],
    outcome: {
      reward: 4,
      description: "You're in class early, ready to start."
    }
  },
  stopped_bathroom: {
    id: 'stopped_bathroom',
    situation: "You stop by the bathroom. When you come out, the halls are getting crowded. The bell is about to ring.",
    choices: [
      {
        id: 'a',
        text: "Hurry to class",
        confidenceLevel: 4,
        nextNodeId: 'class_quiet'
      },
      {
        id: 'b',
        text: "Try to find friends quickly",
        confidenceLevel: 3,
        nextNodeId: 'class_quiet'
      },
      {
        id: 'c',
        text: "Walk calmly to class",
        confidenceLevel: 5,
        nextNodeId: 'class_balanced'
      }
    ],
    outcome: {
      reward: 3,
      description: "You make it to class, but you're cutting it close."
    }
  },
  class_balanced: {
    id: 'class_balanced',
    situation: "Class starts. Your teacher announces a pop quiz. You feel moderately prepared.",
    choices: [
      {
        id: 'a',
        text: "Stay calm and do your best",
        confidenceLevel: 6,
        nextNodeId: 'quiz_nervous'
      },
      {
        id: 'b',
        text: "Feel anxious but push through",
        confidenceLevel: 4,
        nextNodeId: 'quiz_anxious'
      },
      {
        id: 'c',
        text: "Try to stay positive",
        confidenceLevel: 5,
        nextNodeId: 'quiz_nervous'
      }
    ],
    outcome: {
      reward: 5,
      description: "You settle into class. The morning's interactions have you feeling balanced."
    }
  },
  class_quiet: {
    id: 'class_quiet',
    situation: "Class starts. Your teacher announces a pop quiz. You're feeling unprepared.",
    choices: [
      {
        id: 'a',
        text: "Try your best despite feeling unprepared",
        confidenceLevel: 4,
        nextNodeId: 'quiz_anxious'
      },
      {
        id: 'b',
        text: "Feel overwhelmed and struggle",
        confidenceLevel: 2,
        nextNodeId: 'quiz_anxious'
      },
      {
        id: 'c',
        text: "Stay calm and focus on what you know",
        confidenceLevel: 3,
        nextNodeId: 'quiz_anxious'
      }
    ],
    outcome: {
      reward: 2,
      description: "You arrive at class feeling a bit isolated. The quiet morning start makes the quiz announcement feel more daunting."
    }
  },
  quiz_nervous: {
    id: 'quiz_nervous',
    situation: "You finish the quiz feeling uncertain. Class ends and you have a few minutes before your next class.",
    choices: [
      {
        id: 'a',
        text: "Talk to classmates about how it went",
        confidenceLevel: 5,
        nextNodeId: 'between_classes_prep'
      },
      {
        id: 'b',
        text: "Try not to think about it and move on",
        confidenceLevel: 4,
        nextNodeId: 'between_classes_early'
      },
      {
        id: 'c',
        text: "Worry about your grade",
        confidenceLevel: 3,
        nextNodeId: 'between_classes_early'
      }
    ],
    outcome: {
      reward: 4,
      description: "You work through the quiz. It's challenging, but you're managing to answer what you can. The quiz is over, but you're not sure how you did."
    }
  },
  quiz_anxious: {
    id: 'quiz_anxious',
    situation: "The quiz was hard. You're feeling anxious about your performance. Class ends.",
    choices: [
      {
        id: 'a',
        text: "Try to shake it off and focus on next class",
        confidenceLevel: 4,
        nextNodeId: 'between_classes_early'
      },
      {
        id: 'b',
        text: "Talk to a friend about how you're feeling",
        confidenceLevel: 5,
        nextNodeId: 'between_classes_prep'
      },
      {
        id: 'c',
        text: "Dwell on it and feel worse",
        confidenceLevel: 2,
        nextNodeId: 'between_classes_early'
      }
    ],
    outcome: {
      reward: 2,
      description: "You struggle through the quiz. The questions feel difficult, and you're not sure about many of your answers. The quiz left you feeling stressed and uncertain."
    }
  },
  between_classes_prep: {
    id: 'between_classes_prep',
    situation: "You review your notes quickly. Someone mentions a group project due next week.",
    choices: [
      {
        id: 'a',
        text: "Feel stressed but try to stay organized",
        confidenceLevel: 5,
        nextNodeId: 'second_class_collaborative'
      },
      {
        id: 'b',
        text: "Suggest meeting during lunch to plan",
        confidenceLevel: 6,
        nextNodeId: 'second_class_collaborative'
      },
      {
        id: 'c',
        text: "Feel overwhelmed by the news",
        confidenceLevel: 3,
        nextNodeId: 'second_class_stressed'
      }
    ],
    outcome: {
      reward: 4,
      description: "You reviewed your notes or talked to classmates about the quiz. The quiz uncertainty is on your mind, but you're trying to stay on top of things."
    }
  },
  between_classes_early: {
    id: 'between_classes_early',
    situation: "You head to your next class early. A classmate mentions a group project due next week.",
    choices: [
      {
        id: 'a',
        text: "Feel concerned but try to stay positive",
        confidenceLevel: 5,
        nextNodeId: 'second_class_collaborative'
      },
      {
        id: 'b',
        text: "Feel stressed about the project",
        confidenceLevel: 4,
        nextNodeId: 'second_class_stressed'
      },
      {
        id: 'c',
        text: "Try to ignore it for now",
        confidenceLevel: 3,
        nextNodeId: 'second_class_stressed'
      }
    ],
    outcome: {
      reward: 3,
      description: "You headed to class early or tried not to think about the quiz. The quiz uncertainty is weighing on you, and now there's project news too."
    }
  },
  second_class_collaborative: {
    id: 'second_class_collaborative',
    situation: "In your second class, the teacher pairs you with someone for a quick activity.",
    choices: [
      {
        id: 'a',
        text: "Try to work together effectively",
        confidenceLevel: 6,
        nextNodeId: 'lunch_neutral'
      },
      {
        id: 'b',
        text: "Feel a bit awkward but try your best",
        confidenceLevel: 4,
        nextNodeId: 'lunch_awkward'
      },
      {
        id: 'c',
        text: "Struggle to engage",
        confidenceLevel: 3,
        nextNodeId: 'lunch_awkward'
      }
    ],
    outcome: {
      reward: 5,
      description: "You arrive at your second class. The group project discussion from earlier is on your mind, but you're trying to stay organized."
    }
  },
  second_class_stressed: {
    id: 'second_class_stressed',
    situation: "You're in your second class, but you're distracted thinking about the project. The teacher pairs you with someone.",
    choices: [
      {
        id: 'a',
        text: "Try to focus on the activity",
        confidenceLevel: 4,
        nextNodeId: 'lunch_awkward'
      },
      {
        id: 'b',
        text: "Struggle to engage due to stress",
        confidenceLevel: 3,
        nextNodeId: 'lunch_awkward'
      },
      {
        id: 'c',
        text: "Feel overwhelmed and zone out",
        confidenceLevel: 2,
        nextNodeId: 'lunch_awkward'
      }
    ],
    outcome: {
      reward: 2,
      description: "You arrive at your second class feeling stressed about the group project. The news from earlier is weighing on you."
    }
  },
  lunch_neutral: {
    id: 'lunch_neutral',
    situation: "Lunch time. You head to the cafeteria. Your usual table has space.",
    choices: [
      {
        id: 'a',
        text: "Join your usual group",
        confidenceLevel: 6,
        nextNodeId: 'afternoon_inclusive'
      },
      {
        id: 'b',
        text: "Sit with a smaller group",
        confidenceLevel: 5,
        nextNodeId: 'afternoon_new_group'
      },
      {
        id: 'c',
        text: "Sit alone or with one person",
        confidenceLevel: 3,
        nextNodeId: 'afternoon_distracted'
      }
    ],
    outcome: {
      reward: 5,
      description: "The class activity was okay. You waited for your partner to start the conversation, which felt a bit passive. Now lunch has arrived."
    }
  },
  lunch_awkward: {
    id: 'lunch_awkward',
    situation: "Lunch time. You're feeling a bit off. You head to the cafeteria.",
    choices: [
      {
        id: 'a',
        text: "Try to join your usual group anyway",
        confidenceLevel: 4,
        nextNodeId: 'afternoon_distracted'
      },
      {
        id: 'b',
        text: "Sit with a smaller group or alone",
        confidenceLevel: 3,
        nextNodeId: 'afternoon_distracted'
      },
      {
        id: 'c',
        text: "Skip lunch and go to the library",
        confidenceLevel: 2,
        nextNodeId: 'afternoon_distracted'
      }
    ],
    outcome: {
      reward: 2,
      description: "The class activity was difficult. You struggled to engage or felt awkward, which left you feeling off. Now it's lunch time."
    }
  },
  afternoon_inclusive: {
    id: 'afternoon_inclusive',
    situation: "Afternoon classes begin. You're feeling okay. Your last class has a substitute teacher showing a movie.",
    choices: [
      {
        id: 'a',
        text: "Try to stay focused",
        confidenceLevel: 5,
        nextNodeId: 'after_school_relaxed'
      },
      {
        id: 'b',
        text: "Chat quietly with friends",
        confidenceLevel: 4,
        nextNodeId: 'after_school_relaxed'
      },
      {
        id: 'c',
        text: "Zone out",
        confidenceLevel: 3,
        nextNodeId: 'after_school_distracted'
      }
    ],
    outcome: {
      reward: 4,
      description: "Lunch was okay. You joined your usual group or invited someone to sit with you, which felt inclusive. Now afternoon classes are starting."
    }
  },
  afternoon_new_group: {
    id: 'afternoon_new_group',
    situation: "Afternoon classes. You're feeling okay. Last class has a substitute showing a movie.",
    choices: [
      {
        id: 'a',
        text: "Try to pay attention",
        confidenceLevel: 5,
        nextNodeId: 'after_school_relaxed'
      },
      {
        id: 'b',
        text: "Feel restless and chat",
        confidenceLevel: 4,
        nextNodeId: 'after_school_distracted'
      },
      {
        id: 'c',
        text: "Zone out completely",
        confidenceLevel: 3,
        nextNodeId: 'after_school_distracted'
      }
    ],
    outcome: {
      reward: 4,
      description: "Lunch was fine. You sat with a different group to mix things up, which was a nice change. Now afternoon classes are beginning."
    }
  },
  afternoon_distracted: {
    id: 'afternoon_distracted',
    situation: "Afternoon classes. You're having trouble focusing. Last class has a substitute.",
    choices: [
      {
        id: 'a',
        text: "Try to refocus",
        confidenceLevel: 4,
        nextNodeId: 'after_school_distracted'
      },
      {
        id: 'b',
        text: "Continue struggling to focus",
        confidenceLevel: 2,
        nextNodeId: 'after_school_distracted'
      },
      {
        id: 'c',
        text: "Give up and just wait for the day to end",
        confidenceLevel: 2,
        nextNodeId: 'after_school_distracted'
      }
    ],
    outcome: {
      reward: 2,
      description: "Lunch was difficult. You felt awkward, sat alone, or skipped it entirely. The negative feelings are carrying into afternoon classes."
    }
  },
  after_school_relaxed: {
    id: 'after_school_relaxed',
    situation: "School's out! You have options: go home, hang out, or attend a club.",
    choices: [
      {
        id: 'a',
        text: "Hang out with friends briefly",
        confidenceLevel: 6,
        nextNodeId: 'home_social'
      },
      {
        id: 'b',
        text: "Go to a club meeting",
        confidenceLevel: 5,
        nextNodeId: 'home_club'
      },
      {
        id: 'c',
        text: "Head straight home",
        confidenceLevel: 4,
        nextNodeId: 'home_direct'
      }
    ],
    outcome: {
      reward: 5,
      description: "The afternoon passed by. You chatted with friends or tried to pay attention during the movie. School day is done, and you're ready to unwind."
    }
  },
  after_school_distracted: {
    id: 'after_school_distracted',
    situation: "School's finally out. You're feeling drained and ready to go home.",
    choices: [
      {
        id: 'a',
        text: "Head straight home",
        confidenceLevel: 4,
        nextNodeId: 'home_direct'
      },
      {
        id: 'b',
        text: "Try to hang out with friends despite feeling tired",
        confidenceLevel: 3,
        nextNodeId: 'home_social'
      },
      {
        id: 'c',
        text: "Go home and isolate yourself",
        confidenceLevel: 2,
        nextNodeId: 'home_direct'
      }
    ],
    outcome: {
      reward: 2,
      description: "The afternoon was difficult. You struggled to focus, zoned out, or gave up trying. You're relieved the school day is finally over."
    }
  },
  home_club: {
    id: 'home_club',
    situation: "After the club meeting, you're heading home. Your family asks about your day when you arrive.",
    choices: [
      {
        id: 'a',
        text: "Share some highlights",
        confidenceLevel: 5,
        nextNodeId: 'evening_quiet'
      },
      {
        id: 'b',
        text: "Give a brief answer",
        confidenceLevel: 4,
        nextNodeId: 'evening_quiet'
      },
      {
        id: 'c',
        text: "Say 'fine' and avoid talking",
        confidenceLevel: 3,
        nextNodeId: 'evening_isolated'
      }
    ],
    outcome: {
      reward: 5,
      description: "The club meeting was interesting. You're home now, and the day was okay overall."
    }
  },
  home_direct: {
    id: 'home_direct',
    situation: "You head straight home. Your family asks about your day when you arrive.",
    choices: [
      {
        id: 'a',
        text: "Share a bit about your day",
        confidenceLevel: 4,
        nextNodeId: 'evening_quiet'
      },
      {
        id: 'b',
        text: "Say it was fine and head to your room",
        confidenceLevel: 3,
        nextNodeId: 'evening_isolated'
      },
      {
        id: 'c',
        text: "Avoid conversation",
        confidenceLevel: 2,
        nextNodeId: 'evening_isolated'
      }
    ],
    outcome: {
      reward: 3,
      description: "You went straight home after school. You're home now, but you're not feeling particularly social after the day you've had."
    }
  },
  evening_quiet: {
    id: 'evening_quiet',
    situation: "Evening time. You have homework and want to relax. Your phone has some messages.",
    choices: [
      {
        id: 'a',
        text: "Balance homework and relaxation",
        confidenceLevel: 5,
        nextNodeId: 'bedtime_late'
      },
      {
        id: 'b',
        text: "Put off homework",
        confidenceLevel: 3,
        nextNodeId: 'bedtime_stressed'
      },
      {
        id: 'c',
        text: "Do homework but feel stressed",
        confidenceLevel: 4,
        nextNodeId: 'bedtime_stressed'
      }
    ],
    outcome: {
      reward: 4,
      description: "The conversation with family was brief or minimal. You gave a short answer and headed to your room. Now evening has arrived."
    }
  },
  evening_isolated: {
    id: 'evening_isolated',
    situation: "Evening settles in. You're feeling isolated. Homework and messages wait.",
    choices: [
      {
        id: 'a',
        text: "Try to do homework despite feeling down",
        confidenceLevel: 3,
        nextNodeId: 'bedtime_stressed'
      },
      {
        id: 'b',
        text: "Avoid homework and isolate more",
        confidenceLevel: 2,
        nextNodeId: 'bedtime_stressed'
      },
      {
        id: 'c',
        text: "Reach out to a friend",
        confidenceLevel: 4,
        nextNodeId: 'bedtime_late'
      }
    ],
    outcome: {
      reward: 2,
      description: "You avoided conversation with family or said very little. The isolation from earlier in the day is continuing into the evening."
    }
  },
  bedtime_late: {
    id: 'bedtime_late',
    situation: "It's late. You've been up doing homework or chatting. You're tired but not quite ready for bed.",
    isTerminal: true,
    outcome: {
      reward: 5,
      description: "You had a full day. You're tired but satisfied. Tomorrow is a new day with new possibilities."
    }
  },
  bedtime_stressed: {
    id: 'bedtime_stressed',
    situation: "It's bedtime, but you're feeling stressed about unfinished homework or the day's events.",
    isTerminal: true,
    outcome: {
      reward: 3,
      description: "The day is over, but you're going to bed feeling stressed and worried. You hope tomorrow will be better."
    }
  },

  // Path B: Medium confidence start
  woke_up_normal: {
    id: 'woke_up_normal',
    situation: "You get up after one snooze. You have enough time, but you're not rushing.",
    choices: [
      {
        id: 'a',
        text: "Take your time getting ready",
        confidenceLevel: 6,
        nextNodeId: 'ready_confident'
      },
      {
        id: 'b',
        text: "Do a quick routine",
        confidenceLevel: 5,
        nextNodeId: 'ready_quick'
      },
      {
        id: 'c',
        text: "Rush a bit to make up for the snooze",
        confidenceLevel: 4,
        nextNodeId: 'ready_quick'
      }
    ],
    outcome: {
      reward: -1,
      description: "You're up and moving, but as you get out of bed, you stub your toe on the nightstand. It's not serious, but it hurts and puts you in a slightly grumpy mood to start the day."
    }
  },

  // Path C: Low confidence start
  woke_up_late: {
    id: 'woke_up_late',
    situation: "You overslept! You're running late and need to hurry.",
    choices: [
      {
        id: 'a',
        text: "Rush through getting ready quickly",
        confidenceLevel: 4,
        nextNodeId: 'ready_quick'
      },
      {
        id: 'b',
        text: "Skip some steps to save time",
        confidenceLevel: 3,
        nextNodeId: 'ready_quick'
      },
      {
        id: 'c',
        text: "Panic and rush everything",
        confidenceLevel: 2,
        nextNodeId: 'ready_quick'
      }
    ],
    outcome: {
      reward: 1,
      description: "You're running late and feeling stressed."
    }
  }
};
