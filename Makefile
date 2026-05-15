LEAF ?= leaf
DOCS_SECTIONS := getting-started concepts releases web-application cli-reference ci-cd smart-contracts security reference

.PHONY: dev build clean check preview post-build

dev:
	$(LEAF) dev -addr :8080

build: clean
	$(LEAF) build
	@$(MAKE) --no-print-directory post-build

post-build:
	@mkdir -p dist/docs
	@for section in $(DOCS_SECTIONS); do \
		if [ -d "dist/$$section" ]; then mv "dist/$$section" "dist/docs/$$section"; fi; \
	done
	@if [ -f dist/search.json ]; then mv dist/search.json dist/docs/search.json; fi
	@if [ -d dist/assets ]; then cp -R dist/assets dist/docs/assets; fi
	@printf '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta http-equiv="refresh" content="0; url=/docs/getting-started/introduction/">\n<link rel="canonical" href="https://codequill.xyz/docs/getting-started/introduction/">\n<title>CodeQuill Docs</title>\n</head>\n<body><p>Redirecting to the <a href="/docs/getting-started/introduction/">documentation</a>.</p></body>\n</html>\n' > dist/docs/index.html
	@if [ -f dist/sitemap.xml ]; then \
		for section in $(DOCS_SECTIONS); do \
			sed "s|>https://codequill.xyz/$$section/|>https://codequill.xyz/docs/$$section/|g" dist/sitemap.xml > dist/sitemap.xml.tmp && \
			mv dist/sitemap.xml.tmp dist/sitemap.xml; \
		done; \
		grep -v '<loc>https://codequill.xyz/404/</loc>' dist/sitemap.xml > dist/sitemap.xml.tmp && \
		mv dist/sitemap.xml.tmp dist/sitemap.xml; \
	fi
	@echo "Post-build: docs relocated to dist/docs/, sitemap rewritten."

clean:
	rm -rf dist

check: build
	@test -f dist/index.html || (echo "FAIL: dist/index.html missing" && exit 1)
	@test -f dist/docs/index.html || (echo "FAIL: dist/docs/index.html missing" && exit 1)
	@test -f dist/docs/search.json || (echo "FAIL: dist/docs/search.json missing" && exit 1)
	@test -f dist/docs/getting-started/introduction/index.html || (echo "FAIL: first doc page missing" && exit 1)
	@test -f dist/sitemap.xml || (echo "FAIL: dist/sitemap.xml missing" && exit 1)
	@test -f dist/robots.txt || (echo "FAIL: dist/robots.txt missing" && exit 1)
	@test -f dist/assets/css/app.css || (echo "FAIL: dist/assets/css/app.css missing" && exit 1)
	@grep -q '/docs/getting-started/' dist/sitemap.xml || (echo "FAIL: sitemap missing /docs/ URLs" && exit 1)
	@echo "OK: smoke checks passed."

preview:
	cd dist && python3 -m http.server 4173
