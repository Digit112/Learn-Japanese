// A Desmos graph showing some of the variables and their nature:
// https://www.desmos.com/calculator/l9vuo1di6l

// Mastery level is a property of a question, and ranges between 0 and 1. It is an approximate measure of the percentage of time that the user correctly answers that question.
// It is important to understand that mastery level changes in an exponential fashion.
// At a high mastery level, an incorrect answer will significantly decrease the mastery level and a correct answer will only slightly improve it.
// At a low mastery level, the opposite is true, it will increase rapidly but decrease slowly.

// After a question, the mastery for that question is recalculated with this formula:
// new_mastery_level = old_mastery_level * (1 - ADAPTATION_RATE) + did_answer_correctly * ADAPTATION_RATE

// ADAPTATION_RATE is the rate at which the mastery level changes in response to user answers.
// At 0, the mastery level never changes.
// At 1, the mastery level is always 100% if the user answered this question correct last time, 0% if they answered incorrect last time.
// A low adaptation rate makes the mastery level more precise, but will cause the user to be asked way more quesitons.

// The number of consecutive correct answers it takes to go from mastery level b to level t is given by:
// (log(1-t) - log(1-b)) / log(1-ADAPTATION_RATE)

// The number of consecutive incorrect answers to go from b to t is:
// (log(t) - log(b)) / log(1-ADAPTATION_RATE)
const ADAPTATION_RATE = 0.15

// The mastery level of a question which has not been answered.
const STARTING_MASTERY = 0.5

// The "remainder" of a question is 1 minus the current mastery level.

// The weight used for a question in adaptive mode is max(ADAPTIVE_WEIGHT_BIAS ^ (mastery / remainder), 1 / num_active_questions)
// An ADAPTIVE_WEIGHT_BIAS of 0 is the same as having adaptive mode off.
// As ADAPTIVE_WEIGHT_BIAS approaches 1, mastered questions become increasingly rare.
// Anything above 0.5 is already pretty close to having adaptive mode off (at this level, a totally unmastered question is twice as likely to appear as a totally mastered one.)
const ADAPTIVE_WEIGHT_BIAS = 0.65

// The overall difficulty is the sum of the remainders of all available questions, each multiplied by their respective probability of being chosen.
// Since the remainder is an approximate likelihood that the user will answer a question incorrectly,
// overall difficulty is an approximate measure of the likelihood that the user will get the next question wrong (whatever it happens to be)
// The question windowing attempts to keep the overall difficulty approximately constant throughout the session.
// So, IDEAL_OVERALL_DIFFICULTY basically controls how challenging the questions are.
const IDEAL_OVERALL_DIFFICULTY = 0.30

function get_new_question_weight(am_adaptive) {
	return am_adaptive ? Math.pow(ADAPTIVE_WEIGHT_BIAS, STARTING_MASTERY / (1 - STARTING_MASTERY)) : 1
}

function lerp(a, b, t) {
	return (b - a) * t + a
}

// Represents a simple question.
// Tracks the user's responses.
class Question {
	constructor(q, a) {
		// The question and answer.
		// The answer can either be a single item or an array of multiple items, all of which are considered acceptable.
		this.q = q
		if (Array.isArray(a)) {
			this.a = a
		}
		else {
			this.a = [a]
		}
		
		// Approximate measure of user's mastery of this question.
		// It is considered mastered when this is above MASTERY_THRESHHOLD
		this.mastery_level = STARTING_MASTERY
		
		// This is true if this was the last question asked.
		this.was_asked_last = false
		
		// The parent QuestionGroup
		this.parent_group = null
		
		// The number of times attempt() has been called on this question
		this.num_attempts = 0
		
		// Whether this question is within the question window.
		// A question is enabled if any of its ancestor QuestionGroups were checked in the menu.
		// However, if windowing is enabled, it cannot appear until it is windowed.
		// A question is activated by the program when it feels the user has a good grip on all the existing windowed questions.
		this.windowed = false
	}
	
	// Returns true if any of this question's ancestors are enabled.
	// Returns false otherwise.
	get_enabled() {
		if (this.parent_group != null) {
			return this.parent_group.get_enabled()
		}
		
		throw new Error("Question can be neither enabled nor disabled; it has no parent QuestionGroup.")
	}
	
	// Returns whether this question can be picked as the next question the user will see.
	get_active(am_windowed) {
		if (this.windowed && !this.get_enabled()) throw new Error("Cannot be windowed and disabled at once.")
		return am_windowed ? this.windowed : this.get_enabled()
	}
	
	// Checks whether the given answer is correct.
	// Updates responses and recalculates the response_score.
	attempt(response) {
		let correct = this.a.includes(response)
		
		// Causes the earlier attempts to have much higher weight than later attempts.
		// Because of this, the actual adaptation rate will always be slightly above the specified constant.
		let altered_adaptation_rate = lerp(ADAPTATION_RATE, 1, 0.7 * Math.pow(0.7, this.num_attempts))
		this.mastery_level = this.mastery_level * (1 - altered_adaptation_rate) + correct * altered_adaptation_rate
		console.log(this.mastery_level)
		this.was_asked_last = true
		
		this.num_attempts++
		return correct
	}
	
	get_mastery() {
		return this.mastery_level
	}
	
	get_remainder() {
		return 1 - this.mastery_level
	}
	
	// Calculates the adaptive weight of this question, for use in choosing random questions with adaptive mode enabled.
	// Note that the actual weight will be this or the reciprical of the number of questions, whichever is higher.
	get_adaptive_weight() {
		return Math.pow(ADAPTIVE_WEIGHT_BIAS, this.get_mastery() / this.get_remainder())
	}
	
	get_weight(am_adaptive, am_windowed) {
		if (am_adaptive) {
			return this.get_active(am_windowed) * this.get_adaptive_weight()
		}
		else {
			return this.get_active(am_windowed) * 1
		}
	}
	
	get_inactive_weight() {
		return (!this.get_active(true)) * 1
	}
	
	// Called from parent QuestionGroup()
	deactivate_all() {
		this.windowed = false
	}
	
	// Called when the parent QuestionGroup chooses this question for retrieval.
	// The parameter is included so that this function matches the signature of QuestionGroup.get_random, it is unused.
	get_random(_am_adaptive, _am_windowed) {
		return this
	}
	
	// Called when the parent QuestionGroup has chosen this question for activation.
	// The parameters are included so that this function matches the signature of QuestionGroup.activate_question, they are unused.
	activate_question(_am_ordered, _am_adaptive) {
		console.log("Activating " + this.q + ": " + this.a.toString())
		
		if (this.windowed) throw new Error("Cannot activate a windowed question.")
		this.windowed = true
		return this
	}
}

// Each question group either contains other QuestionGroups as children,
// Or Questions as children.
class QuestionGroup {
	constructor(label, children_are_groups = true) {
		console.log("Constructing Group '" + label + "'")
		// The label for this group that the user will see.
		this.label = label
		
		// Whether this is a collection of other QuestionGroups or of Questions.
		this.children_are_groups = children_are_groups
		
		// All children are either QuestionGroups (if children_are_groups is true)
		// or Questions (if children_are_groups is false)
		this.children = []
		
		// The total number of Questions which descend from this group.
		this.weight = 0
		
		// The total number of enabled questions which descend from this group.
		this.enabled_weight = 0
		
		// The total number of windowed questions which descend from this group.
		this.windowed_weight = 0
		
		// The sum of get_adaptive_weight() of all active descended questions.
		// These values are used when getting a random question via tree traversal,
		// but are adjusted to cause a preference for question that are often answered incorrectly.
		this.adaptive_weight = 0
		
		// The estimated probability that the user will answer a question randomly chosen from this group.
		// This is the difficulty of each child, times the probability of that child being chosen, summed over all children.
		this.difficulty = 0
		
		// Whether the checkbox associated with this Group has been manually checked.
		// The questions that descend from this group are included iff this group OR ANY OF ITS ANCESTORS have been manually checked.
		// To determine whether the questions descending from this group can be used, call get_enabled()
		this.is_enabled = false
		
		// The parent QuestionGroup
		this.parent_group = null
		
		// The checkbox associated with this group.
		// Set by generate_HTML()
		this.check_elem = null
	}
	
	// Returns the weight of this node for use in selecting a random question.
	get_weight(am_adaptive, am_windowed) {
		if (am_adaptive) {
			// Note that adaptive weight itself also depends on the value of am_windowed
			// that was passed to cache_weights()
			return this.adaptive_weight
		}
		else {
			if (am_windowed) {
				return this.windowed_weight
			}
			else {
				return this.enabled_weight
			}
		}
	}
	
	// Returns the number of enabled, inactive descendant questions.
	// Used in choosing questions for activation.
	get_inactive_weight() {
		return this.enabled_weight - this.windowed_weight
	}
	
	// Sets a single inactive question to active and updates the relevant weights.
	// If am_ordered, sets the left-most enabled, inactive child to active. This causes questions to be activated in order.
	// Otherwise, choose a random enabled question.
	// Returns null if unable to activate any question. Returns the question otherwise.
	// am_adaptive must be provided so that the difficulties can be appropriately recalculated.
	activate_question(am_ordered, am_adaptive) {
//		console.log("Performing activation: " + am_ordered + ", " + am_adaptive)
		if (this.get_inactive_weight() == 0) return null // No questions to activate.
		
		let random = 0
		if (!am_ordered) random = Math.random() * this.get_inactive_weight()
		
		let sum = 0
		for (let i = 0; i < this.children.length; i++) {
			sum += this.children[i].get_inactive_weight()
			if (random < sum) {
				// Activate descendant question.
//				console.log("Activating child " + i + ": " + (this.children_are_groups ? this.children[i].label : this.children[i].q))
				let ret = this.children[i].activate_question(am_ordered, am_adaptive)
				if (ret == null) throw new Error("Invalid weights on this or child[i]")
				
				return ret
			}
		}
		
		return null
	}
	
	// Returns a randomly chosen active question.
	// Will retry until it finds a question where was_asked_last is false.
	// Assumes cache_weights() has been called.
	get_random(am_adaptive, am_windowed) {
//		console.log("Performing retrieval: " + am_adaptive + ", " + am_windowed)
		let my_weight = this.get_weight(am_adaptive, am_windowed)
		// Note that an active question will almost never have an adaptive_weight of zero, it is actually impossible in the math,
		// but it is possible in practice due to floating point precision limitations.
		if (my_weight == 0) {
			return null
		}
		
		let question = null
		for (let i = 0; i < 20; i++) {
			let random = Math.random() * my_weight
			let sum = 0
			
			for (let j = 0; j < this.children.length; j++) {
				sum += this.children[j].get_weight(am_adaptive, am_windowed)
				
				if (random < sum) {
//					console.log("Retrieving child " + i + ": " + (this.children_are_groups ? this.children[j].label : this.children[j].q) + " because " + random + " (/ " + my_weight + ") < " + sum)
					question = this.children[j].get_random(am_adaptive, am_windowed)
					break
				}
			}
			
			if (question == null || !question.was_asked_last) {
				return question
			}
		}
		
		return null
	}
	
	// Adds a child to this object.
	// The passed child must be either a QuestionGroup or a Question, depending on the value of children_are_groups.
	add_child(new_child) {
		if (this.children_are_groups && new_child instanceof QuestionGroup) {
			this.children.push(new_child)
		}
		else if (!this.children_are_groups && new_child instanceof Question) {
			this.children.push(new_child)
		}
		else {
			throw new TypeError("Failed to add child. Parameter must be Question or QuestionGroup, depending on the value of children_are_groups.")
		}
		
		new_child.parent_group = this
		
		return new_child
	}
	
	// Returns true if this group is enabled or if any of its ancestors are enabled.
	// Returns false otherwise.
	get_enabled() {
		if (this.parent_group == null) {
			return this.is_enabled
		}
		else {
			return this.is_enabled || this.parent_group.get_enabled()
		}
	}
	
	// Recursively calculate the weight, windowed_weight, adaptive_weight, and difficulty of this node and all descendants.
	// am_adaptive must be known to calculate difficulty, am_windowed must be known to calculate the windowed_weight.
	cache_weights(am_adaptive, am_windowed, is_any_ancestor_enabled = false) {
		let am_enabled = is_any_ancestor_enabled || this.is_enabled
		
		this.weight = 0
		this.enabled_weight = 0
		this.windowed_weight = 0
		this.adaptive_weight = 0
		this.difficulty = 0
		
		if (this.children_are_groups) {
			// Cache all child weights.
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].cache_weights(am_adaptive, am_windowed, am_enabled)
			}
			
			// Calculate current weights.
			for (let i = 0; i < this.children.length; i++) {
				this.weight += this.children[i].weight
				this.enabled_weight += this.children[i].enabled_weight
				this.windowed_weight += this.children[i].windowed_weight
				this.adaptive_weight += this.children[i].adaptive_weight
			}
			
			// Calculate difficulties.
			if (this.get_weight(am_adaptive, am_windowed) > 0) { // Do not divide by zero! (This happens if we have no active children, or we are adaptive and all active children have an adaptive_weight of 0)
				for (let i = 0; i < this.children.length; i++) {
					// Multiply child difficulty (probability that the user will answer incorrectly given that the next question comes from the child's descendants)
					// by the probability that the question *will* come from that child, given that it comes from any of the children of this node.
					this.difficulty += this.children[i].difficulty * (this.children[i].get_weight(am_adaptive, am_windowed) / this.get_weight(am_adaptive, am_windowed))
				}
			}
		}
		else {
			// Calculate current weights.
			this.weight = this.children.length
			
			if (am_enabled) {
				this.enabled_weight = this.children.length
			
				for (let i = 0; i < this.children.length; i++) {
					if (this.children[i].get_active(am_windowed)) {
						this.adaptive_weight += this.children[i].get_adaptive_weight()
					}
					
					if (this.children[i].windowed) {
						this.windowed_weight += 1
					}
				}
				
				// Calculate difficulties
				if (this.get_weight(am_adaptive, am_windowed) > 0) { // Do not divide by zero!
					for (let i = 0; i < this.children.length; i++) {
						if (this.children[i].get_active(am_windowed)) {
							this.difficulty += this.children[i].get_remainder() * (this.children[i].get_weight(am_adaptive, am_windowed) / this.get_weight(am_adaptive, am_windowed))
						}
					}
				}
			}
		}
	}
	
	// Create HTML that represents this QuestionGroup so that users can interact with the objects.
	// This function is recursive and only needs to be called once on the root.
	// Generated HTML is automatically appended to the node that is passed.
	generate_HTML(doc_parent) {
		// If this has child collapsibles
		if (this.children_are_groups) {
			// Build collapsible header.
			let header = document.createElement("div")
			header.setAttribute("class", "collapsible_header")
			
			let check_node = document.createElement("input")
			check_node.setAttribute("type", "checkbox")
			check_node.setAttribute("class", "collapsible_check")
			check_node.question_group = this // The checkbox elements know which groups they control.
			
			let button_node = document.createElement("button")
			button_node.setAttribute("type", "button")
			button_node.setAttribute("class", "collapsible")
			button_node.innerHTML = "+"
			
			let text_node = document.createElement("text")
			text_node.innerHTML = this.label
			
			let content = document.createElement("div")
			content.setAttribute("class", "collapsible_content")
			
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].generate_HTML(content)
			}
			
			doc_parent.appendChild(header)
			doc_parent.appendChild(content)
			
			this.check_elem = header.appendChild(check_node)
			header.appendChild(button_node)
			header.appendChild(text_node)
		}
		else {
			let header = document.createElement("div")
			header.setAttribute("class", "collapsible_header")
			
			let check_node = document.createElement("input")
			check_node.setAttribute("type", "checkbox")
			check_node.setAttribute("class", "collapsible_check")
			check_node.question_group = this // The checkbox elements know which groups they control.
			
			let text_node = document.createElement("text")
			text_node.innerHTML = this.label
			
			doc_parent.appendChild(header)
			
			this.check_elem = header.appendChild(check_node)
			header.appendChild(text_node)
		}
	}
	
	// Called by the checkbox event listener to recursively enable all child checkboxes.
	check_all_descendents() {
		if (this.children_are_groups) {
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].check_elem.checked = true
				this.children[i].check_all_descendents()
			}
		}
	}
	
	// Called by the checkbox event listener to recursively disable all child checkboxes.
	// Children are only actually reset if they hadn't been previously checked manually.
	reset_all_descendents() {
		if (this.children_are_groups) {
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].check_elem.checked = this.children[i].get_enabled()
				this.children[i].reset_all_descendents()
			}
		}
		else {
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].windowed &&= this.children[i].get_enabled()
			}
		}
	}
	
	// Recursively sets was_asked_last to false for all questions.
	reset_was_asked_last() {
		if (this.children_are_groups) {
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].reset_was_asked_last()
			}
		}
		else {
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].was_asked_last = false
			}
		}
	}
	
	deactivate_all() {
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].deactivate_all()
		}
	}
	
	// Recursively reset all questions to their default state.
	reset_all(root_call = true) {
		if (this.children_are_groups) {
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].reset_all(false)
			}
		}
		else {
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].was_asked_last = false
				this.children[i].mastery_level = 0.5
			}
		}
	}
	
	// Prints the weight of this node and all descendants.
	debug_weights(depth = 0) {
		let str = ""
		for (let i = 0; i < depth; i++) {
			str += ". "
		}
		
		str += this.label + ": " + this.weight + "/" + this.enabled_weight + "/" + this.windowed_weight + "/" + this.adaptive_weight + "; " + this.difficulty
		
		console.log(str)
		
		if (this.children_are_groups) {
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].debug_weights(depth + 1)
			}
		}
	}
}