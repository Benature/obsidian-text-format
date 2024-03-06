push:
	@git tag "$(tag)"
	@git push origin "$(tag)"

del:
	@git tag -d "$(tag)"
	@git push origin --delete "$(tag)"
