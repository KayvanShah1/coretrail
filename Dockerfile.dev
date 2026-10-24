FROM ruby:3.3-slim AS gems

WORKDIR /site

RUN apt-get update \
    && apt-get install --no-install-recommends -y build-essential \
    && rm -rf /var/lib/apt/lists/*

ENV BUNDLE_PATH=/usr/local/bundle

COPY Gemfile* ./
RUN bundle install --jobs 4 --retry 3

FROM ruby:3.3-slim AS development

WORKDIR /site

ENV BUNDLE_PATH=/usr/local/bundle \
    JEKYLL_ENV=development

COPY --from=gems /usr/local/bundle /usr/local/bundle
COPY Gemfile* ./
COPY _config.yml ./
COPY app ./app

EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000", "--baseurl", "/coretrail", "--livereload", "--force_polling", "--disable-disk-cache"]
