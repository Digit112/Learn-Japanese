old_dict = {
	 "a": "あ",  "i": "い",  "u": "う",  "e": "え",  "o": "お",
	"ka": "か", "ki": "き", "ku": "く", "ke": "け", "ko": "こ",
	"sa": "さ", "si": "し", "su": "す", "se": "せ", "so": "そ",
	"ta": "た", "ti": "ち", "tu": "つ", "te": "て", "to": "と",
	"na": "な", "ni": "に", "nu": "ぬ", "ne": "ね", "no": "の",
	"ha": "は", "hi": "ひ", "hu": "ふ", "he": "へ", "ho": "ほ",
	"ma": "ま", "mi": "み", "mu": "む", "me": "め", "mo": "も",
	"ya": "や",            "yu": "ゆ",             "yo": "よ",
	"ra": "ら", "ri": "り", "ru": "る", "re": "れ", "ro": "ろ",
	"wa": "わ", "wi": "ゐ",            "we": "ゑ", "wo": "を",
	"n": "ん"
}

spacing = 3

new_dict = {}
for k, v in old_dict.items():
	if type(v) == list:
		for w in v:
			new_dict[w] = k
	else:
		new_dict[v] = k

print("{")
for k, v in new_dict.items():
	print("\"" + str(k) + "\": \"" + str(v) + "\", ", end="")
print("\n}")