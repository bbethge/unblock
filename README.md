# Unblock
Unblock is a Django app that allows users to solve, rate, and create
puzzles.  A puzzle is solved by eliminating all the tiles, and
tiles can be eliminated by creating rows or columns of three or
more of the same color.  The only way to move tiles is to swap
horizontally adjacent ones.  If a tile is swapped with empty space,
or if tiles beneath it are destroyed, it may fall.  Each puzzle
has a maximum number of swaps the player is allowed to use.
