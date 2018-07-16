This is a prototype exploring an interactive viewer for local graph alignment.

To check it out you'll need command line git and npm installed, then simply download the repo, move into the repo directory and

`npm install && npm start`

The conclusion coming from the feedback was that exploring many to many mappings in the way is overly cluttered, and
that likely a one graph representation would be preferred, with this type of view acting as a optional supplement
(a "nerd button").

The main takeaways here were that a 'rotate' function would be nice so the user can easily orient the two graphs
in the same direction. Once the two graphs are oriented correctly, then a Sankey-diagram like mapping might provide an
at glance notion for how aligned the graph is. Of course, it gets more complicated as the mapping becomes more and more
redundant (say on average a 3-5 mapping is present, then you have a ton of lines and its hard to tell whats going on),
or the graph structure gets complicated making orienting both graphs the same vertically rather difficult.

The Sankey-diagram is implemented by ordering the lines going from one graph to the center divider by the x-y positions
 of the nodes they extend from. So, each node has an x-y point where it is centered and the node with the highest
 position on the screen will have its connecting edges drawn on the top part of where all the edges are crossing the
 center divider. Ties are resolved by looking at the x position, and further resolved by looking at the connected node
 on the right side of the graph.


If your head hurts from reading the last pargraph check out the instructions above to fire up the prototype, once the
browser opens up, click on the divider between the two graphs (it'll change color). Now you can drag and drop nodes, the
ordering of all the lines in the middle will shift according to the rules I explained in the previous paragraph.
Hopefully it'll make sense when you play with it.

An implementation note for that (if you are using zoom-pan interactivity) is you'll need to have pixel positions
on the center divider AND in the SVG space of the nodes. In this case I accomplished that by letting the node position
live in svg space, and then transform the center divider portion of the line out of svg space. That code is in the
GraphSim.js file, search `const solvedY = this.solveY(offsetforalignlines+(i*inc), f, b, a, xpoint, e, d)` to jump to
where this is happening. "solvedX" and "solvedY" are functions for reversing the SVG transform given by the matrix
numbers: a, b, c, d, e, f. (If you have no idea what I'm talking about take a look at SVG transforms matrix(a,b,c,d,e,f)
 , it takes a little while to wrap your head around but in the end is simple 3d linear algebra on a 2d object).


Another idea that was played with was tying the movement of nodes together across the two graphs.
If you fire up the web app as explained above, you'll see that you can drag and drop nodes into new places.
By default the 'moveOther' flag is up, which means that if you move one node then the most on the other graph will move
along with it. Feedback was that its unclear when there would be a use case for this, I thought it would quickly show
you what nodes were attached, but you could just as well do that with coloration, so in hindsight this feature is
probably not needed.

Something that wasn't done is tying the pan-zoom function of each of the maps so that an similar movement would happen
on either side. That might be interesting, especially if a ZUI was heavily leveraged.
