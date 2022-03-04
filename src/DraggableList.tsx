import React, { MouseEventHandler, useCallback, useRef } from "react";

export function useRefCurrent<T>(value: T) {
	const ref = useRef<T>(value);
	ref.current = value;
	return ref;
}

type Point = { x: number; y: number };

function distance(a: Point, b: Point) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function enumerate<T>(items: T[]) {
	return items.map((item, index) => [item, index] as const);
}

export function DraggableList<T>(props: {
	items: T[];
	onReorder(removeIndex: number, insertIndex: number): void;
	Container(props: { children: React.ReactNode }): React.ReactElement;
	Item(props: { value: T; onMouseDown: MouseEventHandler }): React.ReactElement;
	animateDuration: number;
}) {
	const { items, onReorder, Container, Item } = props;

	const onReorderRef = useRefCurrent(onReorder);

	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		// Only respond to left-clicks
		if (event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();

		const mouseStart = {
			x: event.pageX,
			y: event.pageY,
		};

		const target = event.target as HTMLElement;
		const parent = target.parentNode as HTMLElement;
		const nodes = Array.from(parent.children) as HTMLElement[];
		const startIndex = nodes.indexOf(target);

		// Measure the positions of all the items.
		const positions = nodes.map((node) => {
			return node.getBoundingClientRect();
		});

		const startPosition = positions[startIndex];
		let currentIndex = startIndex;

		for (const node of nodes) {
			if (node === target) continue;
			node.style.transition = `transform ease-in-out ${props.animateDuration}ms`;
		}

		function handleMouseMove(event: MouseEvent) {
			const mouseCurrent = {
				x: event.pageX,
				y: event.pageY,
			};

			const mouseDelta = {
				x: mouseCurrent.x - mouseStart.x,
				y: mouseCurrent.y - mouseStart.y,
			};

			const currentPosition = {
				x: startPosition.x + mouseDelta.x,
				y: startPosition.y + mouseDelta.y,
			};

			const distances = positions.map((position) =>
				distance(currentPosition, position)
			);
			currentIndex = distances.indexOf(Math.min(...distances));

			// Given the list:
			// 1
			// 2
			// 3
			// 4
			// 5
			// If 3 is closer to 1, then 1 and 2 move down.
			// If 3 is closer to 5, then 4 and 5 move up.

			for (const [node, i] of enumerate(nodes)) {
				// If this is the node we're currently dragging...
				if (i === startIndex) {
					node.style.transform = `translate(${mouseDelta.x}px, ${mouseDelta.y}px)`;
					continue;
				}

				// Get the range of nodes that we need to shift.
				const start = Math.min(startIndex, currentIndex);
				const end = Math.max(startIndex, currentIndex);

				if (i >= start && i <= end) {
					const direction = currentIndex < startIndex ? 1 : -1;
					const top = direction * startPosition.height;

					// animate(node, { top }, { easing: spring() });

					node.style.transform = `translate(0, ${top}px)`;
					continue;
				}

				// Clear the transform for the other nodes.
				node.style.transform = "";
			}
		}

		function handleMouseUp() {
			// Clear all transforms.

			target.style.transition = `transform ease-in-out ${props.animateDuration}ms`;

			if (startIndex === currentIndex) {
				target.style.transform = "";
			} else {
				const desiredPosition = positions[currentIndex];
				const { x, y } = {
					x: desiredPosition.x - startPosition.x,
					y: desiredPosition.y - startPosition.y,
				};
				target.style.transform = `translate(${x}px, ${y}px)`;
			}

			function handleTransitionEnd() {
				// Clear the transition and transform so that on the next render,
				// everything will be in the right place.
				for (const node of nodes) {
					node.style.transition = "";
					node.style.transform = "";
				}

				onReorderRef.current(startIndex, currentIndex);
				target.removeEventListener("transitionend", handleTransitionEnd);
			}
			target.addEventListener("transitionend", handleTransitionEnd);

			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		}

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	}, []);

	return (
		<Container>
			{items.map((value, index) => (
				<Item key={index} value={value} onMouseDown={handleMouseDown} />
			))}
		</Container>
	);
}
