#!/bin/sh
# Runs the existing suites against a server already on :8766, two at a time; logs into audit/suites/.
cd "$(dirname "$0")/../.."
OUT=${SUITES_OUT:-audit/suites}; mkdir -p $OUT/out
run() { f=$1; n=$(basename $f .mjs); OUT=$OUT/out timeout 1500 node $f > $OUT/$n.log 2>&1; echo "$n exit=$?" >> $OUT/summary.txt; }
: > $OUT/summary.txt
set -- tools/test9.mjs tools/test17-enemies.mjs tools/test18-combat.mjs tools/test19-v14.mjs tools/test20-loot.mjs tools/test21-inventory.mjs tools/test22-reload.mjs tools/test23-dual-combo.mjs tools/test26-dismember.mjs tools/test27-batch1.mjs tools/test28-guns.mjs tools/test29-force.mjs tools/test30-batch4.mjs tools/test31-batch5.mjs tools/test32-batch6.mjs tools/test33-batch7.mjs tools/test34-playtest.mjs tools/test35-world.mjs tools/test36-shield.mjs tools/test37-audit-fixes.mjs tools/test38-audit-batch2.mjs tools/test39-hero-look.mjs tools/test40-pause.mjs tools/test41-roads.mjs tools/test42-sounds.mjs tools/test43-civilians.mjs tools/test44-barrels-score.mjs
while [ $# -gt 0 ]; do
  run $1 & p1=$!; shift
  if [ $# -gt 0 ]; then run $1 & p2=$!; shift; wait $p2; fi
  wait $p1
done
echo DONE >> $OUT/summary.txt
