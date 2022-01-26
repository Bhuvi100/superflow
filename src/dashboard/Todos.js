import React, { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function Todos(props) {
  let tag = props.selectedTag;
  let lastFetchedTag = props.mainState ? props.mainState.tag : null;

  const [type, setType] = useState(
    props.mainState ? props.mainState.type : "no-answers"
  );
  const [order, setOrder] = useState(
    props.mainState ? props.mainState.order : "desc"
  );
  const [page, setPage] = useState(props.mainState ? props.mainState.page : 1);

  const [data, setData] = useState(
    props.mainState ? props.mainState.results : null
  );
  const [isDataFetched, setIsDataFetched] = useState(
    props.mainState && tag === props.mainState.tag
  );

  let isDataFetching = false;

  function fetchData() {
    if (
      (lastFetchedTag === tag &&
        props.mainState.type === type &&
        props.mainState.order === order &&
        props.mainState.page == page) ||
      isDataFetching
    ) {
      return;
    }

    isDataFetching = true;
    setIsDataFetched(false);

    let request_page = page;

    if (
      lastFetchedTag &&
      (lastFetchedTag !== tag ||
        props.mainState.type !== type ||
        props.mainState.order !== order)
    ) {
      request_page = 1;
      setPage(1);
    }

    axios
      .get(`questions/${type}`, {
        params: {
          order,
          tagged: tag,
          sort: "creation",
          page: request_page,
        },
      })
      .then((response) => {
        setData(response.data);
        setIsDataFetched(true);
        lastFetchedTag = tag;
        props.updateMainState({
          tag: tag,
          type: type,
          order: order,
          page: request_page,
          results: response.data,
        });
        isDataFetching = false;
      });
  }

  useEffect(async () => {
    if (tag) {
      await fetchData();
    }
  }, [tag, type, order, page]);

  return tag ? (
    <div>
      <select
        onChange={(e) => setType(e.target.value)}
        className={"mr-4 mb-3"}
        defaultValue={type}
      >
        <option value="no-answers">Not answered</option>
        <option value="unanswered">Unanswered</option>
      </select>
      <select
        onChange={(e) => setOrder(e.target.value)}
        className={"mb-3"}
        defaultValue={order}
      >
        <option value="desc">Latest</option>
        <option value="asc">Oldest</option>
      </select>
      <div className="flex flex-col">
        {isDataFetched ? (
          <div>
            {data.items.map((question, index) => (
              <div class="p-1 shadow-xl  rounded-2xl" key={index}>
                <a
                  class="block p-6 white-glassmorphism    border sm:p-8 rounded-xl"
                  href={question.link}
                  target="_blank"
                >
                  <div class=" sm:pr-8 flex-col">
                    <p class="mt-2 text-sm desc text-orange-300">
                      {question.title}
                    </p>
                  </div>
                  <hr className="my-4" />
                  <div className="justify-between flex">
                    <div class=" sm:pr-8 flex-col">
                      <a
                        href={question.owner.link}
                        class="mt-2 text-sm desc text-gray-300"
                      >
                        by Author: {question.owner.display_name}
                      </a>
                    </div>
                    <div class=" sm:pr-8 flex-col">
                      <p class="mt-2 text-sm desc text-gray-300">
                        Created on:{" "}
                        {new Date(
                          question.creation_date * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            ))}
            <div className={"flex justify-between"}>
              {page > 1 ? (
                <button
                  className={"bg-white p-2 px-4 mt-2 mb-5"}
                  onClick={() => {
                    setPage(page - 1);
                  }}
                >
                  Previous
                </button>
              ) : (
                ""
              )}
              {data.has_more ? (
                <button
                  className={"bg-white p-2 px-4 mt-2 mb-5"}
                  onClick={() => {
                    setPage(page + 1);
                  }}
                >
                  Next
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          <div>Fetching....</div>
        )}
        {/*//TODO*/}
      </div>
    </div>
  ) : (
    <div>You have not added any tag yet</div> //TODO
  );
}
