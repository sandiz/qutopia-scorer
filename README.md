qutopia scorer

1. install obs
2. install obs-websocket plugin
3. open obs
4. Tools -> websocket server settings -> set port and password
5. goto app (https://sandiz.github.io/qutopia-scorer/)
6. enter host (localhost or ur local ip), port and password (set in #4)
7. click connect
8. if succesful, it should show the quiz setup page
9. fill details, click update obs to update obs with scenes and source reqd.
10. if obs looks good:
		-> start virtual camera
		-> share virtual camera on discord
		-> start recording 
		-> start presentation
		-> update obs source 'PresentationApp' to the relevant app
11. confirm everyone can see the intro obs scene
12. press start quiz on the app to switch to quiz obs scene (it should also show the presentation)
13. present quiz and use the form to add points
14. when finished, click end quiz to show Outro
15. stop-> recording, stop-> virtual camera

TODO:
 * multiple teams support
 * edit previous question