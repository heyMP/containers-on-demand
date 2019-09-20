FROM elmsln/haxcms:4062f5de5

RUN cp -r system/boilerplate/systemsetup _config
RUN chown -R www-data:www-data _config

RUN sed -i -E "s/jeff/admin/g" _config/config.php
RUN sed -i -E "s/jimmerson/admin/g" _config/config.php