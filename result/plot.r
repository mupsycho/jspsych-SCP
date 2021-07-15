source("init.r", encoding = "UTF-8")
library(ggExtra)

# plot
p <- df.Analysis %>%
  dplyr::filter(
    series == 1
  ) %>%
  ggplot(aes(x = rt, y = acc, group = misNum)) +
  geom_point(
    aes(x = rt, y = acc, colour = as.factor(misNum)),
    alpha = 0.6, shape = 16
  ) +
  theme(legend.position = "bottom") +
  labs(x = "reaction time", y = "acc")

ggMarginal(p, type = "boxplot", groupColour = TRUE, groupFill = TRUE)
rm(p)

# quantile plot
gg_js_1 <- df.OL %>%
  dplyr::filter(
    series == 0,
    condition != "",
    rt != "null"
  ) %>%
  dplyr::group_by(shapeNameEn, condition, acc) %>%
  dplyr::summarise(
    a = n() / length(
      shapeNameEn[
        df.OL$shapeNameEn == shapeNameEn &
          df.OL$condition == condition
      ]
    ),
    q1 = quantile(as.integer(rt), probs = c(.1), na.rm = T),
    q3 = quantile(as.integer(rt), probs = c(.3), na.rm = T),
    q5 = quantile(as.integer(rt), probs = c(.5), na.rm = T),
    q7 = quantile(as.integer(rt), probs = c(.7), na.rm = T),
    q9 = quantile(as.integer(rt), probs = c(.9), na.rm = T)
  ) %>%
  pivot_longer(cols = c(q1, q3, q5, q7, q9), names_to = "q")

ggplot(gg_js_1, aes(x = a, y = value, group = q)) +
  geom_point(aes(shape = shapeNameEn)) +
  geom_line(aes(colour = q)) +
  facet_grid(. ~ condition)
rm(gg_js_1)