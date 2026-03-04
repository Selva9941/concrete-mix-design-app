FROM php:8.3-fpm-alpine

WORKDIR /var/www/html

RUN docker-php-ext-install opcache \
  && { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=192'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.revalidate_freq=0'; \
  } > /usr/local/etc/php/conf.d/opcache-recommended.ini

COPY . /var/www/html

RUN addgroup -g 1000 app && adduser -D -u 1000 -G app app \
  && chown -R app:app /var/www/html

USER app

EXPOSE 9000
CMD ["php-fpm", "-F"]
