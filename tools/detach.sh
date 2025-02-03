#!/bin/bash

# Detach script for replacing placeholders in the project
set -e

# Defaults
DRY_RUN=false
NAME=""
DB=""
DOMAIN=""
BRANCH_PREFIX=""
SCRIPT_NAME=$(basename "$0") # Get the name of the script

# Print usage
usage() {
    echo "Usage: $0 --name=NAME [--db=DB] [--branch-prefix=BRANCH_PREFIX] [--domain=DOMAIN] [--dry-run]"
    echo "  --name=NAME           Required. The project name to replace PLACEHOLDER_NAME."
    echo "  --db=DB               Optional. Database name. Defaults to NAME."
    echo "  --branch-prefix=BRANCH_PREFIX Optional. Defaults to NAME."
    echo "  --domain=DOMAIN       Optional. Defaults to NAME."
    echo "  --dry-run             Optional. If set, only shows the replacements."
    exit 1
}

# Parse arguments
for arg in "$@"; do
    case $arg in
    --name=*)
        NAME="${arg#*=}"
        ;;
    --db=*)
        DB="${arg#*=}"
        ;;
    --branch-prefix=*)
        BRANCH_PREFIX="${arg#*=}"
        ;;
    --domain=*)
        DOMAIN="${arg#*=}"
        ;;
    --dry-run)
        DRY_RUN=true
        ;;
    *)
        usage
        ;;
    esac
done

# Validate required arguments
if [[ -z $NAME ]]; then
    echo "Error: --name is required."
    usage
fi

# Set defaults
DB=${DB:-$NAME}
BRANCH_PREFIX=${BRANCH_PREFIX:-$NAME}
DOMAIN=${DOMAIN:-$NAME}

# Function to perform replacements
replace_placeholders() {
    local file="$1"

    if $DRY_RUN; then
        echo "Would replace in $file:"
        grep -oE "PLACEHOLDER_NAME|PLACEHOLDER_NAME_BRANCH_PREFIX|PLACEHOLDER_NAME_DB|PLACEHOLDER_NAME_DOMAIN" "$file" | sort -u
    else
        sed -i.bak -e "s/PLACEHOLDER_NAME/$NAME/g" \
                   -e "s/PLACEHOLDER_NAME_BRANCH_PREFIX/$BRANCH_PREFIX/g" \
                   -e "s/PLACEHOLDER_NAME_DB/$DB/g" \
                   -e "s/PLACEHOLDER_NAME_DOMAIN/$DOMAIN/g" "$file" && rm "${file}.bak"
        echo "Replaced placeholders in $file"
    fi
}

# Find and replace in all relevant files
find . -type f \
    ! -path "./node_modules/*" \
    ! -path "./.next/*" \
    ! -path "./.git/*" \
    ! -name "*.gitignore" |
while read -r file; do
    # Skip the script itself
    if [[ $(basename "$file") == "$SCRIPT_NAME" ]]; then
        continue
    fi

    if grep -qE "PLACEHOLDER_NAME|PLACEHOLDER_NAME_BRANCH_PREFIX|PLACEHOLDER_NAME_DB|PLACEHOLDER_NAME_DOMAIN" "$file"; then
        replace_placeholders "$file"
    fi
done

if $DRY_RUN; then
    echo "Dry run complete. No changes were made."
else
    echo "Replacement complete."
fi

# Add a notice here if you rename the folder that this is in then we need to change this
# nextjs-15-monorepo_mongotestdata -> ${folder name}_mongotestdata
