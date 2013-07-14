#!/bin/sh
TRACE_FILE='TRACE.log'
PROFILE_DIR='/tmp/chrome_test'
#FILE='file:///media/files/Workspace/Anim/examples/index.htm'

FILE=$1

rm -f $TRACE_FILE
rm -rf $PROFILE_DIR

#JS_FLAGS="--trace_deopt --trace_inlining --trace_gc --trace_sim --trace_opt_stats --trace_stub_failures"
JS_FLAGS="--trace_deopt --code_comments --trace_inlining --trace_gc --trace_sim --trace --trace_opt_stats --trace    _opt --trace_stub_failures"

#primusrun chromium --no-sandbox --incognito --user-data-dir=$PROFILE_DIR --js-flags="--trace_deopt --code_comments --trace_inlining --trace_gc --trace_sim --trace --always_opt --trace_opt_stats --trace_opt --always_opt --trace_stub_failures" $FILE > $TRACE_FILE

chromium --no-sandbox --incognito --user-data-dir=$PROFILE_DIR --js-flags="$JS_FLAGS" $FILE > $TRACE_FILE

rm -rf $PROFILE_DIR
