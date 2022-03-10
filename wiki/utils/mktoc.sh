#!/bin/zsh
gitroot=$(git rev-parse --show-toplevel)
wikitop="Top"
pushd -q "$gitroot"

dirdepth=0
headname=""
for dirent in $(find "$wikitop" -type f | sort); do
    fname=$(basename $dirent)
    lname=$(echo ${fname%%.*} | sed 'y/_-/  /')
    dir=$(dirname $dirent)
    hname=$(echo $(basename $dir) | sed 'y/_-/  /')
    curr_depth=0
    for d in $(echo $dir | tr -s '/' ' '); do
        curr_depth=$(( $curr_depth + 1 ))
    done
    if (( $dirdepth != $curr_depth )) || [[ $headname != $hname ]]; then
        printf -v head "%*s" $curr_depth "#"
        head=${head// /\#}
        #printf "%s %s\n" "$head" "$hname"
        dirdepth=$(( $curr_depth - 1 ))
        headname=$hname
    fi
    printf "%*s [%s](%s)\n" $(( $dirdepth * 4 )) '*' "$lname" "$fname"
done
popd -q
