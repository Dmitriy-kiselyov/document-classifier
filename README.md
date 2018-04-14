# document-classifier

Это не классический README о проекте, а просто запись мыслей и план дальнийших действий.

## Этап 1. Клонирование существующей программы

На данный момент реализован алгоритм классификации, что был в моей курсовой работе, с некоторыми поправками на usability.

Алгоритм имеет такой поток выполнения:

* __Этап подготовки данных__
* Программа внутри каждой папки случайным образом разделяет документы на 2 кучи: классифицированные и те, что необходимо распознать.
Сейчас это разбиение составляет 80% и 20% соответственно;
* По всем известным документам строится словарь уникальных слов (обычный `HashMap`);
* Для каждой папки документов получаем маски этих самых папок с помощью словаря;
Маска представляет из себя (большой массив из `0` и `1`, где `0` – слова нет в словаре и `1`, если оно там есть). За позиции
слов в маске отвечает сам словарь;
* По каждой маске строится нейрон;
* __Этап классификации__
* Для каждого нераспознанного документа создается маска
* Каждая маска тестируется на всех нейронах
* Документ принадлежит тому типу нейрона, который распознает документ сильнее всего
* По этим данным собирается статистика

На данный момент качество классификации нейронов плохое:
<img src="https://i.imgur.com/deUJZc5.png" width=600/>

На это есть множество причин. Перечислю:
* ~Словарь содержит очень много мусорных слов, к примеру: `gfk jta vpd isc rit`.
  Это какие-то слова в шапке письма, разбитый на части адрес почты и т.д. Уровень классификации на данных "без мусора" ожидается лучше.
  Возможно, стоит фильтровать слова через словарь настоящих английских слов. А, может, совсем перейти на такой словарь и не подсчитывать
  по документам.~ Также частая практика: отфильтровывать слова с низкой частотой встречаний;
* Нужен стеминг (унисексация) слов [ссылка](http://snowball.tartarus.org/)
* ~Все слова сейчас имеют одинаковый вес. Однако, есть часто встрчающиеся слова: `in I is the...`, а есть специфичные для данного текста.
Нужно каждой группе слов задать свой вес. Так, например, предлоги будут иметь ничтожный вес, а специальные термины – огромный.~
Для такой реализации нужен словарь, в котором будет указана "природа слова".
~Дополнительно можно учитывать количество используемых слов и удалять редкие.~
* На данный момент нейроны имеют алгоритм обучения, но при этом он не используется. Думаю, правильным решением будет
назначить нейрону случайные веса (как это и делается в обычных нейронных сетях) и уже корректировать нейрон,
обучая его на всех доступных файлах;
* Слова в документе, находящиеся рядом, имеют более тесную связь. Можно эти связи как-то учитывать (называется _биграмма_);
* __Контекст__. Диплом называется: "Классификация документов с использованием контекста". Так что нужно подумать, как его сюда прикрутить.

_Дополнительно_:
* сделать нормальное цветное логгирование событий
* запустить паука по РИНЦ, поскачивать документы и классифицировать их по УДК (но это когда будет ну сооовсем нечем себя занять)
* продумать возможность сохранения данных нейронов

# Этап 2. Улучшение словаря

[очень полезная ссылка](https://habrahabr.ru/post/332078/)

У текущей реализации словаря есть гиганстская проблема – он содержит в себе мусорные слова. Что это значит?
Возьмем, например, начало текста из документа выборки:

```
Xref: cantaloupe.srv.cs.cmu.edu alt.atheism:49960 alt.atheism.moderated:713 news.answers:7054 alt.answers:126
Path: cantaloupe.srv.cs.cmu.edu!crabapple.srv.cs.cmu.edu!bb3.andrew.cmu.edu!news.sei.cmu.edu!cis.ohio-state.edu!magnus.acs.ohio-state.edu!usenet.ins.cwru.edu!agate!spool.mu.edu!uunet!pipex!ibmpcug!mantis!mathew
From: mathew <mathew@mantis.co.uk>
Newsgroups: alt.atheism,alt.atheism.moderated,news.answers,alt.answers
```

Это заголовки письма. Конечно же, любой формат содержит в себе некие описанные определенным образом данные,
и в классификаторе при парсинге документа можно их просто проигнорировать.

Рассмотрим, что сделает текущая реализация парсинга
```js
text.trim().split(/[ \n\r,.:/"'+-=<>?!()*$_#`%&\t[\]{}\\^|~]+/g);
```
с такой строчкой:
```
cantaloupe.srv.cs.cmu.edu => [cantaloupe, srv, cs, cmu, edu]
```
То есть текущая реализация разобъет эту очевидно лишнюю для классификатора строчку на аж
целых 5 слов! и добавит в словарь. Такое загрязнение и проводит с таким низким
показателям алгоритма и раздутому (100'000 слов) словарю. Нужно не разбивать слова
бездумно по символам, а оставить разбиение по пробелам, и удалять те, что
имеют большое кол-во знаков внутри себя.

Однако, нужно реализовать это аккуратно, чтобы не нарушить _семантически верный_ парсинг текста.
То есть строчку `привет,мир` нужно разбить на слова `привет, мир`, а строчку
`dmitriy.penetrator@gmail.com` удалить полностью, не разбивая по символам.

**Решение**:

Решил разбить разделяющие символы на 2 группы: те, что всегда разбивают строку на слова:
` \n\r\t,/|\+–=<>()[]{}` и те, что могут находится только на конце слова:
`_.:-?!"'~#;*`. Первые из них использует `Reader` при разбиении строк, второй
– зона ответственности `transformers`, они удаляются только по краям.

_Почему выбраны именно такие символы?_ Символы выбраны так из двух причин:
1) Человек, набравший текст, мог по ошибке не поставить пробел между словами,
но удалять из словаря 2 слова из-за этого не хочется, поэтому я предугадал
эти ошибки, так напирмер фразу `привет,как дела` или `Дима+Таня=любовь` можно
написать без пробелов, а вот ошибку типа `hello"world"` человек вряд ли пропустит.
2) Специальные слова. _Почему `.!?` не входят в символы первой группы?_
Ответ на этот вопрос дает пример, приведенный выше:
`cantaloupe.srv.cs.cmu.edu!crabapple.srv.cs.cmu.edu`, `mathew@mantis.co.uk`.
Шанс, что эти символы являются частью специальных конструций гораздо выше, чем то,
что человек забыл поставить пробел. Да и если в словарь не попадут слова из
`Привет!Как дела?` будет лучше, чем если в словаре окажутся
`cantaloupe srv cs cmu edu`.
3) Также во вторую группу были включены `~#*` и подобные символы. Это задел на будущее.
Например, если в выборке окажутся тексты с языками разметки или программирования.

-------------------------------------

После нововведений размер словаря возвос до `120'000`! Однако, это совсем не плохо.
Даже наоборот, хорошо. Разница означает, что как минимум `20'000` слов в словаре мусорных!
Зато теперь слова `cantaloupe.srv.cs.cmu.edu`, `p?#$a.0rq'&`, `j;^i` четко видны в словаре, а значит пришла пора
вводить новый фильтр, который будет их убирать.

-------------------------------------

Добавил фильтр английских слов: `/^[A-Za-z]([-_'&]?[A-Za-z])*$/`. Количество
слов в словаре, правда, снова уменьшилось до 100'000, однако ожидается, что при этом
качество классификации возрастет. Тем не менее, это означает, что все-таки
необходимо сокращать редко встречающиеся слова в словаре.

К сожалению, качество классификации даже немного упало (точную статистику пока не
веду, процентов примерно на 15), но первые плоды уже есть – скорость классификации
сократилась на 80 секунд.

<img src="https://i.imgur.com/1C3v5sg.png" width=400/>

_В планах_: когда появится конфиг, сделать опцию выбора языка, чтобы пользователь
мог передать кастомную функцию или regex.

-------------------------------------

Добавил возможность фильтровать слова в словаре. Теперь те слова, что встретились
всего 1 раз отбрасываются. Это позволило сократить размер словаря на треть и
соответственно уменьшило на треть время работы. Также качество классификации
возросло на примерно на 4%. Однако, такой фильтрации сейчас явно недостаточно.
Нужно поэкспериментировать и добавить новые фильтры (благо функционал для этого уже подготовлен).

-------------------------------------

Если сейчас заглянуть в словарь, можно увидеть следующую картину:

```
the (209130)
to (104515)
of (98839)
and (83411)
in (69631)
```

Самые часто встречающиеся слова, конечно же, предлоги. Они, как правило,
тоже негативно влияют на качество классификации, уменьшая значимость
действительно ключевых слов текста. Однако, убирать нужно без фанатизма,
поэтому я отфильтровал только те слова, что как мне кажется, встречаются
везде и не влияют на стиль (в будущем хорошо было бы автоматизировать этот процесс):
`a the an | this that there | and or | is to be are was were | it | in on at | for of`.

Еще лучше решение: учитывать все предлоги, но с маленьким весом.

В результате, качество классификации возросло аж на 10%!!!

<img src="https://i.imgur.com/V2oKTkx.png" width=400/>

Убрав около еще 20ти самых популярных слов качество возросло еще на 10%.
Это означает, что они своими весами попросту мешают классификации.

Однако, цель моей дипломной работы – создание универсального классификатора для
всех языков, нужно придумать способ обойти указание предлогов лично.
Одно из предполагаемых решений я написал выше.

-------------------------------------

Стал учитывать количество слов при построении маски. Качество классификации в среднем возросло
на 5%, однако, это может быть просто совпадением.

-------------------------------------

Теперь официально известно, что существует 2 типа фильтров,
первый `ReaderFilter`, он на вход получает _слово_, применяется на этапе, когда
слова из документа уже получены и отредактированы. Второй тип фильтров:
`DictionaryFilter`, применяется на уже готовом общем для всей тестовой выборке.
На вход таким фильтрам подается _слово_ и _количество встречаний этого слова_.

Нужно будет в дальнейшем обдумать, может, вовсе стоит перейти на `DictionaryFilter`
и избавится от `DecorateReader`.

Теперь при построении общего словаря дополнительно строятся словари для
каждого класса документов обучающей выборки. Те слова, что входят в каждый
класс, удаляются из общего словаря (также возможный интерфейс взаимодействия для пользовательских
фильтров). Этот подход позволил избавится от слов, сбивающих и усредняющих классификацию.
Также позволил избавится от необходимости пользовательского фильтра для удаления частых
незначащих слов языка.

В итоге имеем классификатор, улучший свои показатели на аж 25%!!!

<img src="https://i.imgur.com/YHgZ9wr.png" width=400/>

Однако в словаре на первой строчке все же осталось слово
```
ax (32272)
```
Возможно, это знак, что стоит удалять слово, если оно находится в каком-то
большом проценте словарей, а не во всех сразу.

-------------------------------------

Убрал подсчет слов в маске, уровень классификации возрос до 79%.
С чем это связано пока не ясно, нужно будет сделать в конфиге
опцию `shouldCountWordsInMask` по умолчанию `false`.

<img src="https://i.imgur.com/lrrUwhh.png" width=400/>

-------------------------------------

Объединим слова в общем словаре по количеству их встречаний и посмотрим
на отображение, которое строится следующим принципом:

```
количество встречаний => количество таких слов
8 => 1637
7 => 2028
6 => 2609
5 => 3411
4 => 4861
3 => 7470 – резкий скачок (выброс)
2 => 14907
1 => 39085
```

Видно, как с "уникальностью" слова растет их количество. Шанс, что такие
редкие слова попадутся далее по классификации мизерные. Однако, они занимают
место в словаре, чем увеличивают память и время работы, и отрицательно
влияют на качество классификации тех классов, к которым они принадлежат.

На основе этих данных я добавил новый фильтр в словарь по количеству встречаний слов.
Была идея сделать этот фильтр автоматизированным, чтобы он сам определял порог по
этому отображению, однако решил отложить эту идею в пользу того, чтобы пользователь
по этим данным сам определил, какие слова ему удалять.

Я пока выбрал пороговым значением 3. В словаре останутся слова, которые
встречаются 4 или более раз.

Это не увеличило показатель классификатора, однако, сократила словарь до
33000 слов и уменьшило общее время работы с 260 секунд до 180.

-------------------------------------

По поводу слов, которые удаляются из словаря, если они оказались в каждой
классифицируемой категории. Собрал статистику частоты встречания одинаковых
слов в словарях.

Статистика собрана, когда словарь уже отфильтрован, но вышеупомянутые слова
не удалены.

```
7160 5061 4554 3404 2385 1759 1449 1106 881 765 712 666 540 500 490 472 428 447 546 1453
```

7160 слов встречаются лишь в 1 категории, 5061 слово – в двух, ...,
1453 слова встречаются в каждой (их я удаляю). Внешних причин удалять слова,
которые встречаются во всех категориях, кроме одной, нет. График количества
слов плавный, только последнее число дало скачок, собственно, эти слова
и удалил.

Изменил фильтр, теперь дополнительно можно указывать количество
документов, в которых должно быть слово, чтобы его можно было удалить.
Однако, значение все равно оставил на 20ти.

Нужно в будущем сделать такой отчет частью статистики.
