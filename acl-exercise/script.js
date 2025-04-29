// ==================================================
// GLOBAL VARIABLES
// ==================================================
const YOUTUBE_VIDEO_ID = "Czx6LUnG1cs";
let player; // YouTube Player object
let currentExercise = null; // Data of the currently selected exercise
let playbackInterval = null; // Stores the interval ID for checking end time

// ==================================================
// EXERCISE DATA
// IMPORTANT: Timestamps should now be in "HH:MM:SS" or "HH:MM:SS.ms" format
// (e.g., "00:03:10" or "00:03:10.500").
// You still need to meticulously fill this out with ACCURATE times!
// ==================================================
const exerciseData = [
	// === EARLY STAGE ===
	{
		stage: "Early",
		category: "Knee Extension",
		exerciseName: "Heel Prop",
		level: 1,
		startTime: "00:03:28.000",
		endTime: "00:03:41.840",
		instructionsRST: "Hold 10 minutes, 3-5 times per day",
		instructionsCues: "Prop heel up on a surface, allowing gravity to gently straighten the knee. Position might be slightly uncomfortable, but should not be unbearable.",
		modificationNotes: "Over time, can add a light weight (e.g., ankle weight) just above the knee to increase the stretch if needed and tolerated (mentioned 00:03:37.840 - 00:03:42.799).",
		progressionCriteria: "Improved passive knee extension range of motion.",
	},
	{
		stage: "Early",
		category: "Quad Activation",
		exerciseName: "Quad Sets",
		level: 1,
		startTime: "00:03:42.799",
		endTime: "00:04:01.239",
		instructionsRST: "Squeeze quads 10 seconds, relax. Repeat 'all day every day'.",
		instructionsCues: "Tighten the thigh muscle (quadriceps) as if trying to push the back of your knee down into the surface. Aim for a visible contraction.",
		modificationNotes:
			"Can intensify by propping heel up simultaneously, using a strap around the foot to add a calf/hamstring stretch (00:03:52.239 - 00:04:02.159), or using external resistance (ball/band - see next entry).",
		progressionCriteria: "Goal is strong, visible quadriceps contraction without pain.",
	},
	{
		stage: "Early",
		category: "Quad Activation",
		exerciseName: "Quad Sets with Resistance",
		level: 1, // Arguably level 2 of Quad Sets
		startTime: "00:04:02.159",
		endTime: "00:04:10.720",
		instructionsRST: "Same as Quad Sets (Squeeze 10s, repeat often)", // Inferred from context
		instructionsCues: "Perform quad set pushing against external resistance, such as a ball against a wall (knee slightly bent) or a band anchored to an object (pulling knee into flexion).",
		modificationNotes: "These are modifications/progressions of the basic quad set.",
		progressionCriteria: "Ability to generate strong contraction against resistance.",
	},
	{
		stage: "Early",
		category: "Quad Activation",
		exerciseName: "Straight Leg Raise (SLR)",
		level: 1,
		startTime: "00:04:10.720", // Mention starts
		endTime: "00:04:27.680", // Description of all variations ends
		instructionsRST: "3 sets of 10-20 reps (once achievable without lag)",
		instructionsCues: "Lie on back (initially). Tighten quad fully, keep knee completely straight, lift leg 6-12 inches off surface. Control the lowering phase. Ensure no knee bend ('lag').",
		modificationNotes: "Only perform once you can keep the knee perfectly straight throughout. Progress from back lying, to side lying (hip abduction), to stomach lying (hip extension).",
		progressionCriteria: "Ability to perform without any knee bend ('quad lag').",
	},
	{
		stage: "Early",
		category: "Early Strengthening / ROM",
		exerciseName: "Wall Sit / Air Squat / Step Up (Early Intro)",
		level: 1,
		startTime: "00:04:27.680", // Mention starts
		endTime: "00:04:39.280", // Mention ends
		instructionsRST: "Not specified at this point (introduced early, progressed later)",
		instructionsCues: "These exercises will be introduced and progressed. Initially, likely performed with a shortened, comfortable range of motion.",
		modificationNotes: "Focus on pain-free movement and gradual increase in depth/height.",
		progressionCriteria: "Improved tolerance and range of motion.",
	},
	{
		stage: "Early",
		category: "Balance / Proprioception",
		exerciseName: "Single Leg Stance",
		level: 1,
		startTime: "00:04:45.840",
		endTime: "00:04:56.400", // Basic hold description ends
		instructionsRST: "Hold for up to 60 seconds",
		instructionsCues: "Stand on one leg, maintaining balance. Minimize excessive movement.",
		modificationNotes: "Progress by closing eyes (00:04:50.400 - 00:04:54.800), stepping over cones, or walking backwards (00:04:54.800 - 00:04:57.440).",
		progressionCriteria: "Achieve target hold time, then progress to modifications.",
	},
	{
		stage: "Early",
		category: "Range of Motion (Flexion)",
		exerciseName: "Heel Slides (with Strap)",
		level: 1,
		startTime: "00:05:02.960", // Specific exercise explanation starts
		endTime: "00:05:10.400",
		instructionsRST: "Sets of 20 reps, at least 2-3 times per day",
		instructionsCues:
			"Lie on your back or sit. Place a strap (or towel) around your foot/ankle. Gently pull with the strap to slide your heel towards your buttock, bending the knee within comfortable limits. Hold briefly, then slowly straighten.",
		modificationNotes: "",
		progressionCriteria: "Gradually increasing knee flexion angle without significant pain.",
	},
	{
		stage: "Early",
		category: "Range of Motion (Flexion) / Cardio",
		exerciseName: "Stationary Bike",
		level: 1,
		startTime: "00:05:11.199",
		endTime: "00:05:21.280",
		instructionsRST: "Start with ROM focus (minutes as tolerated). Progress to aerobic conditioning (e.g., 45-60 mins, 2-4x/week, mentioned later 00:19:18.480).",
		instructionsCues: "Start with seat high, performing half revolutions back and forth if needed. Progress by lowering the seat gradually and completing full revolutions.",
		modificationNotes: "Adjust seat height to accommodate available knee flexion.",
		progressionCriteria: "Ability to complete full revolutions comfortably. Increase duration/resistance for cardio.",
	},
	{
		stage: "Early", // Can be early/mid depending on intensity
		category: "Quads (Activation/Strengthening)",
		exerciseName: "Isometric Leg Extensions",
		level: 1,
		startTime: "00:10:08.480", // Mentioned later but fits early stage conceptually
		endTime: "00:10:22.079",
		instructionsRST: "Three to five sets of 30 to 45 second holds",
		instructionsCues: "Use leg extension machine or resistance band. Set knee angle (e.g., 90-60 degrees mentioned 00:09:58.240) and hold contraction against resistance without movement.",
		modificationNotes: "Useful early for improving knee extension tolerance and quad function, especially in pain-limited ranges.",
		progressionCriteria: "Increase hold time or resistance.",
	},

	// === MID STAGE ===
	// --- Quads (Squat Progression) ---
	{
		stage: "Mid",
		category: "Quads (Squat Prog.)",
		exerciseName: "Bodyweight Squat (to chair/box)",
		level: 1,
		startTime: "00:06:34.319",
		endTime: "00:06:50.240",
		instructionsRST: "Aim for 3 sets of 20 repetitions",
		instructionsCues: "Stand in front of a chair/box. Initiate squat by pushing hips back. Gently tap butt to chair/box, keeping chest up. Stand back up.",
		modificationNotes: "Shorten range of motion (use higher surface or don't go as deep) if painful. Use hands for assistance if needed (00:06:41.600).",
		progressionCriteria: "Comfortable completion of 3x20 reps with good form.",
	},
	{
		stage: "Mid",
		category: "Quads (Squat Prog.)",
		exerciseName: "Goblet Squat",
		level: 2,
		startTime: "00:06:50.240",
		endTime: "00:06:58.000",
		instructionsRST: "Aim for 3 sets of 15 reps",
		instructionsCues: "Hold a single kettlebell or dumbbell vertically against your chest. Perform squat maintaining upright torso.",
		modificationNotes: "Start with light weight and ensure proper form.",
		progressionCriteria: "Comfortable completion of 3x15 reps with weight.",
	},
	{
		stage: "Mid",
		category: "Quads (Squat Prog.)",
		exerciseName: "Barbell Back Squat",
		level: 3,
		startTime: "00:06:58.000",
		endTime: "00:07:05.280",
		instructionsRST: "Aim for three to four sets of three to eight reps (Heavier load)",
		instructionsCues: "Place barbell across upper back/shoulders. Perform squat focusing on proper form (hip hinge, knee tracking, depth). Control descent and ascent.",
		modificationNotes: "Start with barbell only or very light weight. Seek guidance from a professional if unsure about form.",
		progressionCriteria: "Ability to maintain good form with progressively increasing load.",
	},
	// --- Quads (Split Squat Progression) ---
	{
		stage: "Mid",
		category: "Quads (Split Squat Prog.)",
		exerciseName: "Bodyweight Squat", // Referenced as Level 1 of this progression
		level: 1,
		startTime: "00:07:08.639",
		endTime: "00:07:11.840", // Just the mention
		instructionsRST: "Aim for 3 sets of 20 repetitions", // Copied from previous
		instructionsCues: "Gently tap butt to chair/box, stand back up. Keep chest up, weight balanced.", // Copied from previous
		modificationNotes: "Shorten range if painful. Use hands for assistance if needed.", // Copied from previous
		progressionCriteria: "Comfortable completion of reps.",
	},
	{
		stage: "Mid",
		category: "Quads (Split Squat Prog.)",
		exerciseName: "Split Squat",
		level: 2,
		startTime: "00:07:11.840",
		endTime: "00:07:31.360",
		instructionsRST: "Aim for three sets of 15 reps per leg",
		instructionsCues:
			"Start in a stride stance (one foot forward, one back). Lower body straight down until back knee gently taps floor or pad (like an 'egg you don't want to crack'). Keep front foot flat, push through front leg to return up.",
		modificationNotes: "Shorten range of motion if difficult or painful. Use hands for balance/assistance (00:07:21.039).",
		progressionCriteria: "Comfortable completion of 3x15 reps per leg with good form.",
	},
	{
		stage: "Mid",
		category: "Quads (Split Squat Prog.)",
		exerciseName: "Rear Foot Elevated Split Squat (RFESS)",
		level: 3,
		startTime: "00:07:31.360",
		endTime: "00:07:46.720",
		instructionsRST: "Aim for 3 sets of 15 reps per leg", // Inferred, same as Level 2 initially
		instructionsCues:
			"Place top of back foot on a bench or elevated surface (not too high). Perform split squat. Keep torso position similar to regular split squat. Majority of weight should be through the lead leg.",
		modificationNotes: "Ensure object height is appropriate (start lower).",
		progressionCriteria: "Comfortable completion of reps with good form.",
	},
	{
		stage: "Mid",
		category: "Quads (Split Squat Prog.)",
		exerciseName: "Deficit Rear Foot Elevated Split Squat",
		level: 4,
		startTime: "00:07:46.720",
		endTime: "00:08:04.000",
		instructionsRST: "Aim for three to four sets of three to twelve slow and controlled repetitions per leg",
		instructionsCues: "Perform RFESS with the front foot also elevated on a small object (e.g., 2-4 inch plate/block). Allows for greater range of motion.",
		modificationNotes: "Start with a low deficit height. Majority of weight on lead leg.",
		progressionCriteria: "Over time, can progress the deficit height, reps, or add weight.",
	},
	// --- Quads (Step Down Progression) ---
	{
		stage: "Mid",
		category: "Quads (Step Down Progression)",
		exerciseName: "Step Up",
		level: 1,
		startTime: "00:08:07.039", // Start of Step Up explanation
		endTime: "00:08:27.599", // End of Step Up explanation
		instructionsRST: "Aim for three sets of 20 reps per leg",
		instructionsCues:
			"Use a stair or object approx 6-7 inches high. Place one foot on step. Drive through the top leg to stand up fully. Control the lowering back down. Do NOT push off significantly with the back/bottom leg.",
		modificationNotes: "Decrease height or use hands for assistance if too difficult (00:08:18.720).",
		progressionCriteria: "Comfortable completion of 3x20 reps per leg with good form (minimal push-off).",
	},
	{
		stage: "Mid",
		category: "Quads (Step Down Progression)",
		exerciseName: "Lateral Step Down",
		level: 2,
		startTime: "00:08:27.599",
		endTime: "00:08:38.800",
		instructionsRST: "Aim for 3 sets of 20 reps per leg",
		instructionsCues:
			"Stand on step/box. Keeping stance foot flat, lower the other foot laterally towards the floor, tapping heel gently. Control the ascent. Allows for more forward knee travel over the stance foot.",
		modificationNotes: "Same cues/modifications regarding height/assistance apply as Step Up.",
		progressionCriteria: "Comfortable completion of 3x20 reps per leg with good control.",
	},
	{
		stage: "Mid",
		category: "Quads (Step Down Progression)",
		exerciseName: "Elevated Lateral / Forward Step Down",
		level: 3,
		startTime: "00:08:38.800",
		endTime: "00:08:58.240",
		instructionsRST: "Aim for three to four sets of 6 to 12 slow and controlled reps per leg",
		instructionsCues:
			"Option 1 (Forward): Stand on step, step *forward* off the step, controlling the landing on the stance leg. Option 2 (Elevated Lateral): Perform lateral step down but gradually increase the height of the step.",
		modificationNotes: "Focus on slow, controlled descent and ascent. Can add weight over time.",
		progressionCriteria: "Comfortable completion of reps with good form. Increase height/weight/reps.",
	},
	// --- Quads (Other Options / Isolation) ---
	{
		stage: "Mid",
		category: "Quads (Compound)",
		exerciseName: "Leg Press / Hack Squat / Single Leg Squat",
		level: 2, // General categorization
		startTime: "00:08:58.240", // Mention starts
		endTime: "00:09:06.720", // Mention ends
		instructionsRST: "Varies (e.g., 3-4 sets of 8-15 reps)",
		instructionsCues: "Other options for quad strengthening include machine leg presses, hack squats, or progressing towards single leg squats (pistol squats).",
		modificationNotes: "Can adjust foot position, range of motion, load.",
		progressionCriteria: "Increase load/reps while maintaining form.",
	},
	{
		stage: "Mid",
		category: "Quads (Technique)",
		exerciseName: "Heel Elevation for Quad Emphasis",
		level: "N / A", // Technique modifier
		startTime: "00:09:06.720",
		endTime: "00:09:13.920",
		instructionsRST: "N / A",
		instructionsCues: "Elevating the heels (e.g., on small plates or a ramp) during squats or similar movements can allow for more forward knee travel, potentially increasing quad emphasis.",
		modificationNotes: "Apply as needed/tolerated to relevant exercises.",
		progressionCriteria: "N / A",
	},
	{
		stage: "Mid",
		category: "Quads (Isolation)",
		exerciseName: "Leg Extensions (Limited ROM)",
		level: 1, // Level 1 of Leg Extensions
		startTime: "00:09:56.320", // Start of limited ROM description
		endTime: "00:10:08.480", // End of benefits description
		instructionsRST: "Varies (e.g., 3 sets of 10-15 reps)",
		instructionsCues: "Use leg extension machine. Perform extension only within the 90 to 60 degrees of knee flexion range (90 = fully bent).",
		modificationNotes: "This range is often used early or if full extension is painful/contraindicated, as it puts minimal strain on the ACL graft.",
		progressionCriteria: "Tolerate well, may progress to full ROM when appropriate.",
	},
	{
		stage: "Mid",
		category: "Quads (Isolation)",
		exerciseName: "Leg Extensions (Full ROM)",
		level: 2, // Level 2 of Leg Extensions
		startTime: "00:09:13.920", // General recommendation starts
		endTime: "00:09:32.640", // End of basic rationale
		instructionsRST: "Varies (e.g., 3-4 sets of 8-15 reps)",
		instructionsCues: "Use leg extension machine through available, comfortable range of motion to isolate quadriceps. Control movement, especially eccentric (lowering).",
		modificationNotes: "Highly recommended by speaker to ensure adequate quad training, arguing against outdated safety concerns (00:09:38.959 - 00:09:56.320).",
		progressionCriteria: "Increase weight/reps while maintaining form.",
	},
	// --- Hamstrings (Slider Progression) ---
	{
		stage: "Mid",
		category: "Hamstrings (Slider Prog.)",
		exerciseName: "Double Leg Eccentric Slider",
		level: 1,
		startTime: "00:10:38.560",
		endTime: "00:11:00.720",
		instructionsRST: "Work up to 3 sets of 12 reps",
		instructionsCues:
			"Lie on back, heels on sliders, knees bent. Bridge hips up, keeping glutes squeezed. Slowly slide heels away, extending knees (eccentric phase). Lower hips to floor, slide heels back to start.",
		modificationNotes: "Shorten the range of motion (don't slide out as far) if too difficult (00:10:53.839).",
		progressionCriteria: "Achieve 3 sets of 12 reps with good control.",
	},
	{
		stage: "Mid",
		category: "Hamstrings (Slider Prog.)",
		exerciseName: "Double Leg Slider",
		level: 2,
		startTime: "00:11:00.720",
		endTime: "00:11:06.480",
		instructionsRST: "Aim for 3 sets of 12 reps",
		instructionsCues: "Perform same movement as eccentric slider, but after sliding heels out, actively pull heels back towards hips (concentric phase) using hamstrings before lowering hips.",
		modificationNotes: "",
		progressionCriteria: "Achieve 3 sets of 12 reps.",
	},
	{
		stage: "Mid",
		category: "Hamstrings (Slider Prog.)",
		exerciseName: "Single Leg Eccentric Slider",
		level: 3,
		startTime: "00:11:06.480",
		endTime: "00:11:12.800",
		instructionsRST: "Aim for 3 sets of 8 reps per leg",
		instructionsCues: "Bridge up on two legs. Lift one leg off the floor/slider. Slowly slide the heel of the working leg away (eccentric phase). Lower hips, reset with both feet, repeat.",
		modificationNotes: "Focus on keeping hips level during single leg slide.",
		progressionCriteria: "Achieve 3 sets of 8 reps per leg.",
	},
	{
		stage: "Mid",
		category: "Hamstrings (Slider Prog.)",
		exerciseName: "Single Leg Slider",
		level: 4,
		startTime: "00:11:12.800",
		endTime: "00:11:19.680",
		instructionsRST: "Aim for three to four sets of four to eight reps per leg",
		instructionsCues: "Bridge up on one leg (heel on slider). Slide heel out, then actively pull heel back in using hamstring, all while maintaining single leg bridge. Lower and repeat.",
		modificationNotes: "Very challenging; ensure mastery of previous levels.",
		progressionCriteria: "Increase reps/sets.",
	},
	// --- Hamstrings (Bridge Progression) ---
	{
		stage: "Mid",
		category: "Hamstrings (Bridge Prog.)",
		exerciseName: "Feet Elevated Long Lever Bridge (Isometric Hold)",
		level: 1,
		startTime: "00:11:24.880",
		endTime: "00:11:37.760",
		instructionsRST: "Aim for three sets of 45 seconds",
		instructionsCues: "Lie on back, place both heels on a bench or elevated surface with only a slight bend in the knees. Bridge hips up until body is straight from shoulders to heels. Hold.",
		modificationNotes: "Longer lever (straighter knees) increases hamstring demand.",
		progressionCriteria: "Achieve 3 sets of 45s holds.",
	},
	{
		stage: "Mid",
		category: "Hamstrings (Bridge Prog.)",
		exerciseName: "Feet Elevated Long Lever Bridge (Marching)",
		level: 2,
		startTime: "00:11:37.760",
		endTime: "00:11:48.640",
		instructionsRST: "Aim for three sets of 60 seconds total (alternating legs)",
		instructionsCues:
			"Hold the top position of the feet elevated bridge. Slowly lift one foot slightly off the bench, then lower it and lift the other, alternating while keeping hips stable and elevated.",
		modificationNotes: "Focus on minimizing hip drop or rotation.",
		progressionCriteria: "Achieve 3 sets of 60s total marching time.",
	},
	{
		stage: "Mid",
		category: "Hamstrings (Bridge Prog.)",
		exerciseName: "Single Leg Feet Elevated Long Lever Bridge (Isometric Hold)",
		level: 3,
		startTime: "00:11:48.640",
		endTime: "00:11:56.079",
		instructionsRST: "Aim for three sets of 45 seconds per leg",
		instructionsCues: "Set up as level 1, but lift one leg completely off the bench. Bridge up on the single supporting leg, keeping hips level and elevated. Hold.",
		modificationNotes: "",
		progressionCriteria: "Achieve 3 sets of 45s holds per leg.",
	},
	{
		stage: "Mid",
		category: "Hamstrings (Bridge Prog.)",
		exerciseName: "Single Leg Feet Elevated Long Lever Bridge (Reps)",
		level: 4,
		startTime: "00:11:56.079",
		endTime: "00:12:06.560",
		instructionsRST: "Aim for three to four sets of eight to fifteen repetitions per leg",
		instructionsCues: "Perform single leg bridge (as described in Level 3) but move dynamically, lowering hips towards floor and bridging back up for reps.",
		modificationNotes: "Ensure full hip extension at the top.",
		progressionCriteria: "Increase reps/sets.",
	},
	// --- Hamstrings (Other Options) ---
	{
		stage: "Mid",
		category: "Hamstrings",
		exerciseName: "Nordic Hamstring Curl",
		level: 3, // Generally advanced
		startTime: "00:12:12.959", // Mention only
		endTime: "00:12:16.240", // Mention only
		instructionsRST: "Varies (e.g., 3 sets of 3-8 reps)",
		instructionsCues: "Kneel with ankles secured (partner or setup). Slowly lower torso towards floor, controlling descent with hamstrings. Push back up or use minimal hand assist.",
		modificationNotes: "Often requires assistance (bands, hands) initially. Focus on eccentric.",
		progressionCriteria: "Increase controlled range of motion / reduce assistance.",
	},
	{
		stage: "Mid",
		category: "Hamstrings/Glutes",
		exerciseName: "RDL (Romanian Deadlift)",
		level: 2, // Can be loaded heavily
		startTime: "00:12:16.240", // Mention only
		endTime: "00:12:17.519", // Mention only
		instructionsRST: "Varies (e.g., 3 sets of 8-12 reps)",
		instructionsCues:
			"Stand holding weight (barbell/dumbbells). Hinge at hips, keeping back straight and slight knee bend. Lower weight towards floor, feeling hamstring stretch. Return to start by extending hips.",
		modificationNotes: "Start light, focus on form (hip hinge vs. squat). Single leg version detailed under balance.",
		progressionCriteria: "Increase weight/reps while maintaining form.",
	},
	{
		stage: "Mid",
		category: "Hamstrings (Isolation)",
		exerciseName: "Seated/Prone Hamstring Curl",
		level: 1, // Machine based, adjustable
		startTime: "00:12:17.519", // Mention only
		endTime: "00:12:20.000", // Mention only
		instructionsRST: "Varies (e.g., 3 sets of 10-15 reps)",
		instructionsCues: "Use machine to perform knee flexion against resistance, isolating hamstrings.",
		modificationNotes: "Adjust machine setup for proper fit.",
		progressionCriteria: "Increase weight/reps.",
	},
	{
		stage: "Mid",
		category: "Hamstrings/Glutes/Back",
		exerciseName: "Roman Chair Variations (e.g., Back Extension)",
		level: 2,
		startTime: "00:12:20.000", // Mention only
		endTime: "00:12:22.880", // Mention only
		instructionsRST: "Varies (e.g., 3 sets of 10-15 reps)",
		instructionsCues: "Position self in Roman chair/hyperextension bench. Hinge at hips, lowering torso. Extend hips/back to return to straight line. Can emphasize glutes/hamstrings with technique.",
		modificationNotes: "Can hold weight for added resistance.",
		progressionCriteria: "Increase reps/weight.",
	},
	// --- Calves (Straight Knee Progression - Gastrocnemius focus) ---
	{
		stage: "Mid",
		category: "Calves (Straight Knee)",
		exerciseName: "Double Leg Heel Raise (Flat Ground)",
		level: 1,
		startTime: "00:12:42.800",
		endTime: "00:12:53.200",
		instructionsRST: "Aim for three sets of 25 slow and controlled reps",
		instructionsCues: "Stand with feet flat, knees straight. Rise up onto the balls of your feet as high as possible. Control the lowering back down.",
		modificationNotes: "Use hands for balance as needed (00:12:50.320).",
		progressionCriteria: "Achieve 3x25 reps with good control.",
	},
	{
		stage: "Mid",
		category: "Calves (Straight Knee)",
		exerciseName: "Single Leg Heel Raise (Flat Ground)",
		level: 2,
		startTime: "00:12:53.200",
		endTime: "00:12:59.920",
		instructionsRST: "Aim for three sets of fifteen reps per leg",
		instructionsCues: "Stand on one leg, keeping knee straight. Perform heel raise on the single supporting leg.",
		modificationNotes: "Use hands for balance.",
		progressionCriteria: "Achieve 3x15 reps per leg.",
	},
	{
		stage: "Mid",
		category: "Calves (Straight Knee)",
		exerciseName: "Single Leg Heel Raise (on Step)",
		level: 3,
		startTime: "00:12:59.920",
		endTime: "00:13:10.959",
		instructionsRST: "Aim for three to four sets of 8 to 15 reps per leg",
		instructionsCues: "Stand with the ball of one foot on the edge of a step, heel hanging off. Keep knee straight. Lower heel below step level for stretch, then rise up as high as possible.",
		modificationNotes: "Allows for greater range of motion. Can add weight (holding dumbbell) as needed (00:13:07.040).",
		progressionCriteria: "Achieve target reps, then add weight.",
	},
	// --- Calves (Bent Knee Progression - Soleus focus) ---
	{
		stage: "Mid",
		category: "Calves (Bent Knee - Soleus)",
		exerciseName: "Seated Heel Raise (Flat Ground)",
		level: 1,
		startTime: "00:13:14.639",
		endTime: "00:13:23.920",
		instructionsRST: "Aim for 3 sets of eight to fifteen slow and controlled reps",
		instructionsCues: "Sit with feet flat on floor, knees bent (approx 90 degrees). Lift heels off the floor, pushing through balls of feet.",
		modificationNotes: "Can place weight (dumbbells, plates) on knees for resistance.",
		progressionCriteria: "Achieve target reps.",
	},
	{
		stage: "Mid",
		category: "Calves (Bent Knee - Soleus)",
		exerciseName: "Deficit Seated Heel Raise",
		level: 2,
		startTime: "00:13:23.920",
		endTime: "00:13:36.639",
		instructionsRST: "Aim for three to four sets of eight to fifteen reps",
		instructionsCues: "Perform seated heel raise with balls of feet elevated on a step or block, allowing heels to drop lower for greater ROM.",
		modificationNotes: "Use barbell across knees, smith machine, dumbbells, or a dedicated seated calf raise machine for resistance (00:13:29.519).",
		progressionCriteria: "Increase weight/reps.",
	},
	// --- Hips/Trunk (Copenhagen Plank Progression - Adductors) ---
	{
		stage: "Mid",
		category: "Hips/Trunk (Adductors)",
		exerciseName: "Isometric Adductor Squeeze (Ball)",
		level: 1,
		startTime: "00:13:53.279",
		endTime: "00:14:02.320",
		instructionsRST: "Aim for 3 sets of 60 seconds hold (as progression criteria)",
		instructionsCues: "Lie on back, knees bent or straight. Place a ball (or pillow) between knees or ankles. Squeeze the ball as hard as comfortably possible and hold.",
		modificationNotes: "",
		progressionCriteria: "Achieve 3 sets of 60s holds.",
	},
	{
		stage: "Mid",
		category: "Hips/Trunk (Adductors)",
		exerciseName: "Short Copenhagen Plank (Isometric Hold)",
		level: 2,
		startTime: "00:14:02.320",
		endTime: "00:14:09.040",
		instructionsRST: "Aim for 3 sets of 60 seconds hold (as progression criteria)",
		instructionsCues: "Lie on side. Place top knee (bent) on a bench. Bottom leg is bent underneath. Support on bottom forearm. Lift hips so trunk is straight and thighs are together. Hold.",
		modificationNotes: "Leverage is shorter, making it easier than long version.",
		progressionCriteria: "Achieve 3 sets of 60s holds.",
	},
	{
		stage: "Mid",
		category: "Hips/Trunk (Adductors)",
		exerciseName: "Long Copenhagen Plank (Isometric Hold)",
		level: 3,
		startTime: "00:14:09.040",
		endTime: "00:14:14.560", // Description ends
		instructionsRST: "Aim for 3 sets of 60 seconds hold (as progression criteria)",
		instructionsCues: "Similar setup to short version, but top leg is straight with ankle/lower leg resting on bench. Bottom leg straight underneath (or slightly bent). Lift hips, hold.",
		modificationNotes: "",
		progressionCriteria: "Achieve 3 sets of 60s holds.",
	},
	{
		stage: "Mid",
		category: "Hips/Trunk (Adductors)",
		exerciseName: "Long Copenhagen Plank (Reps)",
		level: 4,
		startTime: "00:14:14.560",
		endTime: "00:14:28.800",
		instructionsRST: "Aim for three to four sets of eight to twelve slow and controlled repetitions",
		instructionsCues: "Assume the long Copenhagen plank starting position (hips slightly lowered). Lift hips up into the plank and lower with control for reps.",
		modificationNotes: "",
		progressionCriteria: "Increase reps/sets.",
	},
	// --- Hips/Trunk (Hip Thrust Progression - Extensors/Glutes) ---
	{
		stage: "Mid",
		category: "Hips/Trunk (Extensors - Glutes)",
		exerciseName: "Double Limb Glute Bridge",
		level: 1,
		startTime: "00:14:32.000",
		endTime: "00:14:44.480",
		instructionsRST: "Aim for three sets of 20 reps",
		instructionsCues:
			"Lie on back, knees bent, feet flat on floor hip-width apart. Squeeze glutes and lift hips towards ceiling until body forms straight line from shoulders to knees. Lower with control.",
		modificationNotes: "",
		progressionCriteria: "Achieve 3x20 reps.",
	},
	{
		stage: "Mid",
		category: "Hips/Trunk (Extensors - Glutes)",
		exerciseName: "Single Limb Glute Bridge",
		level: 2,
		startTime: "00:14:44.480",
		endTime: "00:14:50.079",
		instructionsRST: "Aim for 3 sets of 15 reps per leg",
		instructionsCues: "Start in glute bridge position. Lift one foot off the floor, keeping knee bent or straight. Perform bridge on the single supporting leg, keeping hips level.",
		modificationNotes: "Avoid letting hip drop on the non-working side.",
		progressionCriteria: "Achieve 3x15 reps per leg.",
	},
	{
		stage: "Mid",
		category: "Hips/Trunk (Extensors - Glutes)",
		exerciseName: "Single Limb Hip Thrust",
		level: 3,
		startTime: "00:14:50.079",
		endTime: "00:15:00.240",
		instructionsRST: "Aim for 3 to 4 sets of 12 to 15 slow and controlled reps per leg",
		instructionsCues: "Place upper back across a bench, feet on floor. Lift one leg. Lower hips towards floor, then drive through supporting heel, squeezing glute to lift hips up. Keep hips level.",
		modificationNotes: "Allows greater range of motion than bridge. Can add weight across hips (dumbbell, barbell) as needed (00:14:56.240).",
		progressionCriteria: "Achieve target reps, then add weight.",
	},
	// --- Hips/Trunk (Side Plank Progression - Abductors/Lateral Core) ---
	{
		stage: "Mid",
		category: "Hips/Trunk (Abductors/Lateral Core)",
		exerciseName: "Short Side Plank (from Knees)",
		level: 1,
		startTime: "00:15:03.360",
		endTime: "00:15:11.120",
		instructionsRST: "Aim for 3-4 sets working towards 60 second holds",
		instructionsCues: "Lie on side, support on forearm (elbow under shoulder) and bottom knee. Keep knees bent. Lift hips so body forms straight line from head to knees. Hold.",
		modificationNotes: "",
		progressionCriteria: "Achieve target hold time.",
	},
	{
		stage: "Mid",
		category: "Hips/Trunk (Abductors/Lateral Core)",
		exerciseName: "Side Plank (from Feet)",
		level: 2,
		startTime: "00:15:11.120",
		endTime: "00:15:20.639",
		instructionsRST: "Aim for 3-4 sets working towards 60 second holds",
		instructionsCues: "Lie on side, support on forearm and side of bottom foot. Stack feet or stagger them. Lift hips so body forms straight line from head to feet. Hold.",
		modificationNotes: "Ensure no hip sagging or rotation.",
		progressionCriteria: "Achieve target hold time.",
	},
	{
		stage: "Mid",
		category: "Hips/Trunk (Abductors/Lateral Core)",
		exerciseName: "Side Plank Hip Abduction",
		level: 3,
		startTime: "00:15:20.639",
		endTime: "00:15:36.880",
		instructionsRST: "Aim for 3-4 sets (reps or time based, e.g., 10-15 reps or working towards 60s)", // Text implies 60s goal applies, user interpretation needed. Let's use reps: "3-4 sets of 10-15 reps"
		instructionsCues: "Assume the side plank position (from feet). While holding the plank, slowly lift the top leg up (hip abduction) and lower it with control.",
		modificationNotes: "Maintain stable plank throughout leg movement.",
		progressionCriteria: "Increase reps/sets or hold time under control.",
	},
	// --- Dynamic Balance ---
	{
		stage: "Mid", // Can be used for testing or training
		category: "Dynamic Balance / Proprioception",
		exerciseName: "Y-Balance Test / Reach",
		level: 1, // As an exercise
		startTime: "00:15:46.800",
		endTime: "00:16:12.720",
		instructionsRST: "Begin with 3 sets of 30 seconds reaching in each direction, work up to 60 seconds.",
		instructionsCues:
			"Stand on one leg. Imagine or mark a 'Y' shape on the floor (anterior, posteromedial, posterolateral). Reach other foot as far as possible along each line, lightly tapping foot. Return to center without losing balance. Do not put significant weight on reaching foot.",
		modificationNotes: "Use tape or cones as visual targets. Start with small reaches and gradually increase distance.",
		progressionCriteria: "Increase reach distance while maintaining balance and form. Increase duration.",
	},
	// --- Dynamic Balance (Single Leg RDL Progression) ---
	{
		stage: "Mid",
		category: "Dynamic Balance / Hamstrings / Glutes",
		exerciseName: "Single Leg RDL",
		level: 1,
		startTime: "00:16:16.320",
		endTime: "00:16:42.639",
		instructionsRST: "Aim for 3 sets of 12 to 15 reps per leg",
		instructionsCues:
			"Stand on one leg, slight bend in stance knee. Hinge at the hip, extending the non-stance leg straight back. Keep back straight, lower torso towards parallel with ground. Return to start position under control, trying not to touch non-stance foot down.",
		modificationNotes: "Use hands for balance support (e.g., on wall/stick), shorten range of motion, or tap foot down between reps if needed (00:16:32.240).",
		progressionCriteria: "Achieve target reps with good balance and form.",
	},
	{
		stage: "Mid", // Or Late
		category: "Dynamic Balance / Hamstrings / Glutes",
		exerciseName: "3-Way RDL Reach",
		level: 2,
		startTime: "00:16:42.639",
		endTime: "00:16:55.839",
		instructionsRST: "Aim for 4 to 5 reps total per leg (1 rep = Left, Middle, Right reach)",
		instructionsCues: "Perform single leg RDL hinge. While hinged, reach arms towards the left, then center, then right side. Return to starting position. This completes one repetition.",
		modificationNotes: "Requires significant balance and control.",
		progressionCriteria: "Achieve target reps with good balance.",
	},
	{
		stage: "Mid", // Or Late
		category: "Dynamic Balance / Hamstrings / Glutes",
		exerciseName: "3-Way RDL Reach with Knee Drive",
		level: 3,
		startTime: "00:16:55.839",
		endTime: "00:17:03.680",
		instructionsRST: "Aim for 4 to 5 reps total per leg (1 rep = L, M, R reach + drive)",
		instructionsCues: "Perform the 3-Way RDL Reach. As you return to the upright standing position, drive the non-stance knee up towards the chest.",
		modificationNotes: "Adds complexity and dynamic balance challenge.",
		progressionCriteria: "Increase reps/sets or add light weight.",
	},
	// Placeholder for later stage exercises mentioned but not detailed like Mid-Stage
	{
		stage: "Late",
		category: "Plyometrics (Vertical)",
		exerciseName: "Vertical Jump Progression (CMJ, Depth Drop/Jump)",
		level: 1, // Starting plyos
		startTime: "00:23:01.520", // Mention starts
		endTime: "00:23:28.320", // Mention ends
		instructionsRST: "Start low volume (e.g., 3-4 sets of 4-8 reps), focus on quality, 2-3x/week",
		instructionsCues:
			"Progress from Countermovement Jumps (to box, then for height), to Depth Drops (stepping off box, landing softly), to Depth Jumps (stepping off, immediate jump). Progress Bilateral -> Unilateral.",
		modificationNotes: "Requires adequate strength base (e.g., 1.5x BW single leg press for unilateral plyos, 00:22:27.600). Focus on landing mechanics.",
		progressionCriteria: "Mastery of landing, increase height/complexity.",
	},
	{
		stage: "Late",
		category: "Plyometrics (Deceleration)",
		exerciseName: "Deceleration Progression (Lunge, Step/Land)",
		level: 1, // Starting deceleration focus
		startTime: "00:23:30.159", // Mention starts
		endTime: "00:23:50.720", // Mention ends
		instructionsRST: "Incorporate into training, focus on quality",
		instructionsCues: "Progress from controlled Forward Lunges -> Forward Lunge with push back -> Step forward & Land softly -> Step & Land then Step Back -> Running stop / Running with Step Back.",
		modificationNotes: "Focus on absorbing force through quads/hips, maintaining balance.",
		progressionCriteria: "Increase speed/intensity of movement while maintaining control.",
	},
];

// ==================================================
// HELPER FUNCTION: Timestamp Conversion
// ==================================================
/**
 * Converts a timestamp string ("HH:MM:SS" or "HH:MM:SS.ms") to seconds.
 * @param {string} timestamp - The timestamp string.
 * @returns {number} Total seconds, or 0 if parsing fails.
 */
function convertTimestampToSeconds(timestamp) {
	if (typeof timestamp !== "string") {
		console.error("Invalid timestamp format (not a string):", timestamp);
		return 0;
	}
	const timeParts = timestamp.split(":");
	let hours = 0,
		minutes = 0,
		seconds = 0,
		milliseconds = 0;

	try {
		if (timeParts.length === 3) {
			// HH:MM:SS.ms or HH:MM:SS
			hours = parseInt(timeParts[0], 10);
			minutes = parseInt(timeParts[1], 10);
			const secMsParts = timeParts[2].split(/[.,]/); // Split seconds/ms by . or ,
			seconds = parseInt(secMsParts[0], 10);
			milliseconds = parseInt(secMsParts[1] || "0", 10); // Default ms to 0 if not present
		} else if (timeParts.length === 2) {
			// MM:SS.ms or MM:SS
			minutes = parseInt(timeParts[0], 10);
			const secMsParts = timeParts[1].split(/[.,]/);
			seconds = parseInt(secMsParts[0], 10);
			milliseconds = parseInt(secMsParts[1] || "0", 10);
		} else if (timeParts.length === 1 && !isNaN(parseFloat(timeParts[0]))) {
			// SS.ms or SS (less likely needed)
			const secMsParts = timeParts[0].split(/[.,]/);
			seconds = parseInt(secMsParts[0], 10);
			milliseconds = parseInt(secMsParts[1] || "0", 10);
		} else {
			console.error("Could not parse timestamp structure:", timestamp);
			return 0;
		}

		// Check if parsing resulted in NaN
		if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) {
			console.error("NaN detected during timestamp parsing:", timestamp);
			return 0;
		}

		return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
	} catch (error) {
		console.error("Error parsing timestamp:", timestamp, error);
		return 0;
	}
}

// ==================================================
// YOUTUBE API FUNCTIONS
// ==================================================

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
function onYouTubeIframeAPIReady() {
	player = new YT.Player("youtube-player", {
		height: "360", // These might be overridden by CSS aspect ratio
		width: "640",
		videoId: YOUTUBE_VIDEO_ID,
		playerVars: {
			playsinline: 1, // Important for mobile playback
			rel: 0, // Don't show related videos at end
		},
		events: {
			onReady: onPlayerReady,
			// 'onStateChange': onPlayerStateChange // Optional: Can use for more complex logic
		},
	});
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
	console.log("YouTube Player Ready!");
	document.getElementById("replay-button").disabled = false; // Enable replay button once player is ready
}

// Helper to stop playback interval checker
function stopPlaybackChecker() {
	if (playbackInterval) {
		clearInterval(playbackInterval);
		playbackInterval = null;
	}
}

// Function to play a specific segment
function playExerciseSegment(exercise) {
	if (!player || typeof player.seekTo !== "function") {
		console.error("Player not ready or invalid.");
		alert("YouTube player is not ready. Please wait or check your connection.");
		return;
	}

	stopPlaybackChecker();
	currentExercise = exercise; // Store currently playing exercise data

	// *** CONVERT TIMESTAMPS TO SECONDS ***
	const startTimeSeconds = convertTimestampToSeconds(exercise.startTime);
	const endTimeSeconds = convertTimestampToSeconds(exercise.endTime);

	// Check if conversion was successful (returned non-zero)
	if (endTimeSeconds <= startTimeSeconds && exercise.startTime !== "00:00:00" && exercise.startTime !== "0") {
		// Allow 0 start time, but otherwise end time must be after start time
		console.error(`Invalid time range for ${exercise.exerciseName}: Start ${startTimeSeconds}s, End ${endTimeSeconds}s`);
		alert(`Error: Invalid time range configured for ${exercise.exerciseName}. Please check the data.`);
		return; // Prevent playback attempt
	}

	// Use the converted seconds for seeking and checking
	player.seekTo(startTimeSeconds, true);
	player.playVideo();

	// Set an interval to check if we've reached the end time
	playbackInterval = setInterval(() => {
		if (player && typeof player.getCurrentTime === "function") {
			const currentTime = player.getCurrentTime();
			// Use converted endTimeSeconds
			if (currentTime >= endTimeSeconds) {
				player.pauseVideo(); // Pause when end time is reached
				stopPlaybackChecker(); // Clear the interval
			}
		} else {
			stopPlaybackChecker(); // Clear if player becomes invalid
		}
	}, 250); // Check every 250ms
}

// ==================================================
// UI POPULATION AND EVENT HANDLING (No changes needed here)
// ==================================================
function populateNavigation() {
	const sidebar = document.getElementById("sidebar");
	const groupedData = {};

	// --- Add originalIndex to data during processing ---
	exerciseData.forEach((ex, index) => {
		const exerciseWithIndex = { ...ex, originalIndex: index }; // Add index here

		if (!groupedData[exerciseWithIndex.stage]) {
			groupedData[exerciseWithIndex.stage] = {};
		}
		if (!groupedData[exerciseWithIndex.stage][exerciseWithIndex.category]) {
			groupedData[exerciseWithIndex.stage][exerciseWithIndex.category] = [];
		}
		groupedData[exerciseWithIndex.stage][exerciseWithIndex.category].push(exerciseWithIndex);
	});
	// --- End modification ---

	for (const stageName in groupedData) {
		const stageUl = document.createElement("ul");
		stageUl.classList.add("stage");
		const stageSpan = document.createElement("span");
		stageSpan.textContent = stageName;
		stageSpan.onclick = (e) => e.target.parentElement.classList.toggle("collapsed");
		stageUl.appendChild(stageSpan);

		for (const categoryName in groupedData[stageName]) {
			const categoryUl = document.createElement("ul");
			categoryUl.classList.add("category");
			const categorySpan = document.createElement("span");
			categorySpan.textContent = categoryName;
			categorySpan.onclick = (e) => e.target.parentElement.classList.toggle("collapsed");
			categoryUl.appendChild(categorySpan);

			// Now iterates over objects that already have originalIndex
			groupedData[stageName][categoryName].forEach((ex) => {
				const exerciseLi = document.createElement("li");
				exerciseLi.classList.add("exercise-item");
				exerciseLi.textContent = `${ex.exerciseName} ${ex.level ? `- Lvl ${ex.level}` : ""}`;
				// Use the pre-assigned originalIndex
				exerciseLi.dataset.exerciseIndex = ex.originalIndex;

				exerciseLi.addEventListener("click", handleExerciseClick);
				categoryUl.appendChild(exerciseLi);
			});
			stageUl.appendChild(categoryUl);
		}
		sidebar.appendChild(stageUl);
	}
}
function handleExerciseClick(event) {
	const selectedLi = event.currentTarget;
	const exerciseIndex = parseInt(selectedLi.dataset.exerciseIndex, 10);

	if (isNaN(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= exerciseData.length) {
		console.error("Invalid exercise index:", selectedLi.dataset.exerciseIndex);
		return;
	}

	// --- Retrieve the exercise data using the index ---
	// We need the version with the originalIndex added, which is now directly in exerciseData
	// (if you added it manually) OR we retrieve it from the main array.
	// Let's assume exerciseData itself now contains the originalIndex.
	const exercise = exerciseData[exerciseIndex];
	// If you didn't add originalIndex manually to the main array, ensure it's added
	// *before* storing in currentExercise inside playExerciseSegment or here.
	// Safest is to add it during populateNavigation or directly to the main array.

	if (!exercise) {
		console.error("Exercise data not found for index:", exerciseIndex);
		return;
	}

	// Update UI
	displayExerciseDetails(exercise);
	highlightActiveExercise(selectedLi);

	// Play video segment
	playExerciseSegment(exercise); // This now sets currentExercise
}

function displayExerciseDetails(exercise) {
	const titleEl = document.getElementById("exercise-title");
	const instructionsEl = document.getElementById("instructions-area");
	const replayButton = document.getElementById("replay-button");
	const nextButton = document.getElementById("next-exercise-button");

	// Ensure exercise object is valid before proceeding
	if (!exercise) {
		console.error("displayExerciseDetails called with invalid exercise data.");
		titleEl.textContent = "Error loading exercise";
		instructionsEl.innerHTML = "<p>Could not load exercise details.</p>";
		replayButton.disabled = true;
		nextButton.disabled = true;
		return;
	}

	titleEl.textContent = `${exercise.stage}: ${exercise.exerciseName} ${exercise.level ? `- Level ${exercise.level}` : ""}`;

	// (Instructions HTML generation remains the same)
	let instructionsHTML = `<h3>Instructions</h3><ul>`;
	if (exercise.instructionsCues) {
		instructionsHTML += `<li><i class="fas fa-chalkboard-teacher"></i> <strong>Cues:</strong> ${exercise.instructionsCues}</li>`;
	}
	if (exercise.instructionsRST) {
		instructionsHTML += `<li><i class="fas fa-stopwatch"></i> <strong>Reps/Sets/Time:</strong> ${exercise.instructionsRST}</li>`;
	}
	if (exercise.modificationNotes) {
		instructionsHTML += `<li><i class="fas fa-sliders-h"></i> <strong>Modifications:</strong> ${exercise.modificationNotes}</li>`;
	}
	if (exercise.progressionCriteria) {
		instructionsHTML += `<li><i class="fas fa-arrow-up"></i> <strong>Progression:</strong> ${exercise.progressionCriteria}</li>`;
	}
	instructionsHTML += `</ul>`;
	instructionsEl.innerHTML = instructionsHTML;

	// --- Enable/Disable Buttons ---
	const playerReady = player && typeof player.seekTo === "function";
	replayButton.disabled = !playerReady;

	// Check if there is a next exercise using the *currently selected* exercise object
	// Make sure originalIndex exists on the exercise object
	const hasNext = exercise && exercise.originalIndex !== undefined && exercise.originalIndex < exerciseData.length - 1;
	nextButton.disabled = !playerReady || !hasNext;
}

function highlightActiveExercise(selectedElement) {
	// (No changes needed here)
	const currentlyActive = document.querySelector(".exercise-item.active");
	if (currentlyActive) {
		currentlyActive.classList.remove("active");
	}
	if (selectedElement) {
		selectedElement.classList.add("active");
	}
}

// --- Add setup function for Next Button ---
function setupNextButton() {
	const nextButton = document.getElementById("next-exercise-button");
	nextButton.addEventListener("click", () => {
		if (!currentExercise) {
			console.warn("Next clicked but no current exercise selected.");
			return;
		}

		const currentIndex = currentExercise.originalIndex;
		const nextIndex = currentIndex + 1;

		if (nextIndex < exerciseData.length) {
			// Find the corresponding list item in the sidebar
			const nextLiElement = document.querySelector(`.exercise-item[data-exercise-index="${nextIndex}"]`);
			if (nextLiElement) {
				// Simulate a click on the next list item
				// This reuses the existing logic for updating UI and playing video
				nextLiElement.click();
			} else {
				console.error("Could not find the list item for the next exercise index:", nextIndex);
				// Fallback: manually trigger updates if needed, though finding the Li is better
				// const nextExercise = exerciseData[nextIndex];
				// displayExerciseDetails(nextExercise);
				// highlightActiveExercise(null); // Or try to find it again
				// playExerciseSegment(nextExercise);
			}
		} else {
			console.log("Already at the last exercise.");
			// Button should already be disabled by displayExerciseDetails, but double-check
			nextButton.disabled = true;
		}
	});
}

// --- Modify initialization ---
function setupControlButtons() {
	const replayButton = document.getElementById("replay-button");
	const nextButton = document.getElementById("next-exercise-button"); // Add reference

	replayButton.addEventListener("click", () => {
		// (Existing replay logic)
		if (currentExercise && player && typeof player.seekTo === "function") {
			stopPlaybackChecker();
			playExerciseSegment(currentExercise);
		} else if (!currentExercise) {
			alert("Please select an exercise first.");
		} else {
			alert("Player not ready.");
		}
	});

	// Next button click logic
	nextButton.addEventListener("click", () => {
		if (!currentExercise) {
			console.warn("Next clicked but no current exercise selected.");
			return;
		}

		const currentIndex = currentExercise.originalIndex; // Assumes originalIndex is on currentExercise
		const nextIndex = currentIndex + 1;

		if (nextIndex < exerciseData.length) {
			const nextLiElement = document.querySelector(`.exercise-item[data-exercise-index="${nextIndex}"]`);
			if (nextLiElement) {
				// Simulate a click on the next list item
				nextLiElement.click();
			} else {
				console.error("Could not find the list item for the next exercise index:", nextIndex);
				// Potentially add fallback logic here if needed
			}
		} else {
			console.log("Already at the last exercise.");
			nextButton.disabled = true; // Ensure it's disabled
		}
	});
}

function setupSidebarToggle() {
	const toggleButton = document.getElementById("sidebar-toggle");
	const bodyElement = document.body;
	const iconElement = toggleButton.querySelector("i"); // Get the icon element

	// Function to apply state (used on load and on toggle)
	const applySidebarState = (isCollapsed) => {
		if (isCollapsed) {
			bodyElement.classList.add("sidebar-collapsed");
			iconElement.className = "fas fa-bars"; // Or 'fa-chevron-right'
			toggleButton.setAttribute("aria-label", "Show Sidebar");
		} else {
			bodyElement.classList.remove("sidebar-collapsed");
			iconElement.className = "fas fa-times"; // Or 'fa-chevron-left' or 'fa-arrow-left'
			toggleButton.setAttribute("aria-label", "Hide Sidebar");
		}
	};

	// 1. Check localStorage on Load
	const savedState = localStorage.getItem("sidebarCollapsed") === "true";
	applySidebarState(savedState);

	// 2. Add Click Listener
	toggleButton.addEventListener("click", () => {
		const isCurrentlyCollapsed = bodyElement.classList.contains("sidebar-collapsed");
		const newStateCollapsed = !isCurrentlyCollapsed;

		applySidebarState(newStateCollapsed);

		// 3. Save State to localStorage
		localStorage.setItem("sidebarCollapsed", newStateCollapsed);
	});
}

// ==================================================
// INITIALIZATION (Update to call new setup function)
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
	// Add originalIndex if needed
	exerciseData.forEach((ex, index) => {
		if (ex.originalIndex === undefined) {
			ex.originalIndex = index;
		}
	});

	populateNavigation();
	setupControlButtons();
	setupSidebarToggle(); // <-- Add this call

	// YouTube API will call onYouTubeIframeAPIReady automatically
});
