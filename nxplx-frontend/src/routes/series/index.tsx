import orderBy from "lodash/orderBy";
import { Component, h } from "preact";
import Helmet from "preact-helmet";
import Loading from "../../components/Loading";
import { SeasonEntry } from "../../components/SeasonEntry";
import { formatInfoPair } from "../../utils/common";
import http from "../../utils/http";
import { imageUrl, round, SeriesDetails } from "../../utils/models";
import * as style from "./style.css";

interface Props {
    id: string
}

interface State {
    details: SeriesDetails,
    bg: string
}

export default class Series extends Component<Props, State> {
    public componentDidMount(): void {
        http.get(`/api/episode/${this.props.id}/detail`)
            .then(response => response.json())
            .then((details: SeriesDetails) => {
                const bg = `background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("${imageUrl(details.backdrop, 1280)}");`;
                this.setState({ details, bg });
            });
    }


    public render(_, { details, bg }: State) {
        if (!details) {
            return (<Loading fullscreen/>);
        }
        return (
            <div class={style.bg} style={bg} data-bg={details.backdrop}>
                <div class={`nx-scroll ${style.content}`}>
                    <Helmet title={`${details.name} - NxPlx`}/>
                    <div>
                        <h2 class={[style.title, style.marked].join(" ")}>{details.name}</h2>
                    </div>
                    <img class={style.poster} src={imageUrl(details.poster, 500)}
                         alt=""/>
                    <span class={[style.info, style.marked].join(" ")}>
                        <table>
                            {
                                [
                                    // {title: 'Released', value: details.seasons[0].airDate.substr(0, 4)},
                                    // {title: 'Episode run time', value: formatRunTime(details.e)},
                                    {
                                        title: "Rating",
                                        value: `${round(details.voteAverage)}/10 from ${details.voteCount} votes`
                                    },
                                    { title: "Genres", value: details.genres.map(g => g.name).join(", ") },
                                    { title: "Networks", value: details.networks.map(n => n.name).join(", ") },
                                    {
                                        title: "Production companies",
                                        value: details.productionCompanies.map(pc => pc.name).join(", ")
                                    },
                                    { title: "Seasons", value: details.seasons.length.toString() }
                                    // {title: 'Episodes', value: details.seasons.reduce((acc, s) => acc + s.episodes.length, 0).toString()},
                                ].map(formatInfoPair)
                            }
                        </table>
                    </span>
                    <div>
                        {orderBy(details.seasons, ["number"], ["asc"])
                            .map(season => (
                                <SeasonEntry
                                    key={season.number}
                                    details={details}
                                    season={season}/>)
                            )}
                    </div>
                </div>
            </div>
        );
    }
}
