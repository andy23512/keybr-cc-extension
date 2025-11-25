import Draggable from "react-draggable";
import "./app.component.css";
import LayoutContainerComponent from "./layout-container.component";

function AppComponent() {
  return (
    <Draggable>
      <LayoutContainerComponent></LayoutContainerComponent>
    </Draggable>
  );
}

export default AppComponent;
