#!/bin/bash
# SPDX-License-Identifier: AGPL-3.0-only

JARFILE=openapi-generator-cli-7.2.0.jar
DOWNLOAD_LOCATION=https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/7.2.0/openapi-generator-cli-7.2.0.jar

if test -f "$JARFILE"; then
  echo "$JARFILE exists."
else
  echo "$JARFILE does not exist, download it from $DOWNLOAD_LOCATION"
  curl $DOWNLOAD_LOCATION > $JARFILE
fi

java -jar $JARFILE generate \
    -i ../diag-server.yml \
    -g python-flask \
    -o . \
    -c config.yaml \
    --ignore-file-override=.openapi-generator-ignore

# add SPDX headers to all auto-generated python files
for PYFILE in $(find -name "*.py"); do
    if grep -lq "SPDX-License-Identifier" "$PYFILE"; then
	continue
    fi

    echo "Adding SPDX license identifier to auto-generated file $PYFILE"
    echo "# SPDX-License-Identifier: AGPL-3.0-only" > /tmp/spdx-tmp
    cat "$PYFILE" >> /tmp/spdx-tmp
    mv /tmp/spdx-tmp "$PYFILE"
done
