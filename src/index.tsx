import React, { MouseEventHandler, ReactNode, useState } from "react";
import ReactDOM from "react-dom";
import { DraggableList } from "./DraggableList";

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
	const newList = [...list];
	const [item] = newList.splice(startIndex, 1);
	newList.splice(endIndex, 0, item);
	return newList;
}

function ListItem(props: { value: number; onMouseDown: MouseEventHandler }) {
	return (
		<div
			style={{
				height: 150,
				width: 100,
				border: "1px solid black",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyItems: "center",
				cursor: "grab",
			}}
			onMouseDown={props.onMouseDown}
		>
			{props.value}
		</div>
	);
}

function ListContainer(props: { children: ReactNode }) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
			}}
		>
			{props.children}
		</div>
	);
}

function App() {
	const [items, setItems] = useState([0, 1, 2, 3, 4, 5]);

	return (
		<DraggableList
			items={items}
			onReorder={(startIndex, endIndex) =>
				setItems(reorder(items, startIndex, endIndex))
			}
			Container={ListContainer}
			Item={ListItem}
			animateDuration={120}
		/>
	);
}

const main = document.querySelector("main");

ReactDOM.render(<App />, main);
