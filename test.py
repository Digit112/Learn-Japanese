import random

# Testing the theory that leaf nodes in a tree can be selected by caching the sums of their weights in their ancestor nodes and performing a single weighted tree traversl.

class node:
	def __init__(self, depth):
		self.selections = 0
		
		depth += random.randint(-2, 1)
		
		if depth > 0:
			self.left = node(depth-1)
			self.right = node(depth-1)
			
			self.weight = self.left.weight + self.right.weight
		
		else:
			self.left = None
			self.right = None
			
			self.weight = random.randrange(1, 6)
	
	def get_random(self):
		self.selections += 1
		
		if self.left is not None:
			r = random.random() * self.weight
			
			if r < self.left.weight:
				self.left.get_random()
			else:
				self.right.get_random()
	
	def debug(self, root_weight = 0, root_selections = 0, depth = 0):
		if depth == 0:
			root_weight = self.weight
			root_selections = self.selections
		
		# Print the weight, fraction of the total weight, selections, fraction of total selections.
		# The fractions should roughly match because of how get_random() is structured.
		print("  " * depth + "%05d = %05d" % (int(self.weight / root_weight * 100000), int(self.selections / root_selections * 100000)))
		
		if self.left is not None:
			self.left.debug(root_weight, root_selections, depth+1)
			self.right.debug(root_weight, root_selections, depth+1)

n = node(12)
for i in range(100000):
	n.get_random()

n.debug()